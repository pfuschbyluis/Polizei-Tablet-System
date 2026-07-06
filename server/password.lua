-- Password hashing for POLIS (fast HMAC-SHA256 for FiveM)
Password = {}

local sha256 = PolisSHA256

local SALT_LENGTH = 16

local function randomBytes(length)
    local bytes = {}
    for i = 1, length do
        bytes[i] = string.char(math.random(0, 255))
    end
    return table.concat(bytes)
end

local function base64Encode(data)
    local b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    return ((data:gsub('.', function(x)
        local r, n = '', x:byte()
        for i = 8, 1, -1 do
            r = r .. ((n % 2 ^ i - n % 2 ^ (i - 1) > 0) and '1' or '0')
        end
        return r
    end) .. '0000'):gsub('%d%d%d?%d?%d?%d?', function(x)
        if #x < 6 then return '' end
        local c = 0
        for i = 1, 6 do
            c = c + (x:sub(i, i) == '1' and 2 ^ (6 - i) or 0)
        end
        return b:sub(c + 1, c + 1)
    end) .. ({ '', '==', '=' })[#data % 3 + 1])
end

local function base64Decode(data)
    local b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    data = data:gsub('[^' .. b .. '=]', '')
    return (data:gsub('.', function(x)
        if x == '=' then return '' end
        local r, f = '', (b:find(x) - 1)
        for i = 6, 1, -1 do
            r = r .. ((f % 2 ^ i - f % 2 ^ (i - 1) > 0) and '1' or '0')
        end
        return r
    end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)
        if #x ~= 8 then return '' end
        local c = 0
        for i = 1, 8 do
            c = c + (x:sub(i, i) == '1' and 2 ^ (8 - i) or 0)
        end
        return string.char(c)
    end))
end

local function constantTimeEquals(a, b)
    if #a ~= #b then return false end
    local diff = 0
    for i = 1, #a do
        diff = diff | (a:byte(i) ~ b:byte(i))
    end
    return diff == 0
end

local function pbkdf2(password, salt, iterations, keyLength)
    local blocks = math.ceil(keyLength / 32)
    local result = {}

    for block = 1, blocks do
        local u = sha256.hmac(password, salt .. string.char(
            (block >> 24) & 0xff,
            (block >> 16) & 0xff,
            (block >> 8) & 0xff,
            block & 0xff
        ))
        local t = u
        for _ = 2, iterations do
            u = sha256.hmac(password, u)
            local xored = {}
            for i = 1, #t do
                xored[i] = string.char(t:byte(i) ~ u:byte(i))
            end
            t = table.concat(xored)
        end
        result[#result + 1] = t
    end

    return table.concat(result):sub(1, keyLength)
end

local function verifyFast(plainPassword, saltB64, hashB64)
    local salt = base64Decode(saltB64)
    local expected = base64Decode(hashB64)
    local actual = sha256.hmac(plainPassword, salt)
    return constantTimeEquals(actual, expected)
end

local function verifyLegacyPbkdf2(plainPassword, storedHash)
    local iterations, saltB64, hashB64 = storedHash:match('^%$pbkdf2%-sha256%$(%d+)%$([^$]+)%$([^$]+)$')
    if not iterations then
        return false
    end

    local salt = base64Decode(saltB64)
    local expected = base64Decode(hashB64)
    local actual = pbkdf2(plainPassword, salt, tonumber(iterations), #expected)
    return constantTimeEquals(actual, expected)
end

function Password.Hash(plainPassword)
    if not plainPassword or plainPassword == '' then
        return nil
    end
    math.randomseed(os.time() + math.random(1, 999999))
    local salt = randomBytes(SALT_LENGTH)
    local hash = sha256.hmac(plainPassword, salt)
    return ('$polis$v2$%s$%s'):format(base64Encode(salt), base64Encode(hash))
end

function Password.Verify(plainPassword, storedHash)
    if not plainPassword or not storedHash or storedHash == '' then
        return false
    end

    local saltB64, hashB64 = storedHash:match('^%$polis$v2%$([^$]+)%$([^$]+)$')
    if saltB64 then
        return verifyFast(plainPassword, saltB64, hashB64)
    end

    return verifyLegacyPbkdf2(plainPassword, storedHash)
end

function Password.NeedsRehash(storedHash)
    return storedHash and not storedHash:match('^%$polis$v2%$')
end

function Password.Rehash(plainPassword)
    return Password.Hash(plainPassword)
end
