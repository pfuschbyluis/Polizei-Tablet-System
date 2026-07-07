Repository = {}

function RepositoryMappers.rowToEmployee(row)
    return {
        id = row.id,
        badgeNumber = row.badge_number,
        name = row.name,
        rank = row.rank,
        active = row.active == 1 or row.active == true,
        createdAt = row.created_at,
        passwordHash = row.password_hash,
        roleTemplateId = row.role_template_id,
        permissions = Permissions.FromTable(Database.DecodeJson(row.permissions, {})),
    }
end

function RepositoryMappers.rowToRoleTemplate(row)
    return {
        id = row.id,
        name = row.name,
        description = row.description,
        isSystem = row.is_system == 1 or row.is_system == true,
        permissions = Permissions.FromTable(Database.DecodeJson(row.permissions, {})),
    }
end

function RepositoryMappers.rowToPerson(row)
    return {
        id = row.id,
        firstName = row.first_name,
        lastName = row.last_name,
        dateOfBirth = row.date_of_birth,
        address = row.address,
        city = row.city,
        phone = row.phone,
        photoUrl = row.photo_url,
        priorConvictions = Database.DecodeJson(row.prior_convictions, {}),
        arrestWarrants = Database.DecodeJson(row.arrest_warrants, {}),
        notes = Database.DecodeJson(row.notes, {}),
        linkedVehicleIds = Database.DecodeJson(row.linked_vehicle_ids, {}),
        linkedWeaponIds = Database.DecodeJson(row.linked_weapon_ids, {}),
    }
end

function RepositoryMappers.rowToPersonSummary(row)
    return {
        id = row.id,
        firstName = row.first_name,
        lastName = row.last_name,
        dateOfBirth = row.date_of_birth,
        address = row.address,
        city = row.city,
        phone = row.phone,
        photoUrl = row.photo_url,
        priorConvictions = Database.DecodeJson(row.prior_convictions, {}),
        arrestWarrants = Database.DecodeJson(row.arrest_warrants, {}),
        notes = {},
        linkedVehicleIds = Database.DecodeJson(row.linked_vehicle_ids, {}),
        linkedWeaponIds = Database.DecodeJson(row.linked_weapon_ids, {}),
    }
end

function RepositoryMappers.rowToCaseSummary(row)
    return {
        id = row.id,
        caseNumber = row.case_number,
        title = row.title,
        offense = row.offense,
        status = row.status,
        createdAt = row.created_at,
        updatedAt = row.updated_at,
        assignedOfficerId = row.assigned_officer_id,
        assignedOfficerName = row.assigned_officer_name,
        description = row.description,
        participants = {},
        evidence = {},
        witnesses = {},
        internalNotes = {},
        linkedVehicleIds = Database.DecodeJson(row.linked_vehicle_ids, {}),
    }
end

function RepositoryMappers.rowToCase(row)
    return {
        id = row.id,
        caseNumber = row.case_number,
        title = row.title,
        offense = row.offense,
        status = row.status,
        createdAt = row.created_at,
        updatedAt = row.updated_at,
        assignedOfficerId = row.assigned_officer_id,
        assignedOfficerName = row.assigned_officer_name,
        description = row.description,
        participants = Database.DecodeJson(row.participants, {}),
        evidence = Database.DecodeJson(row.evidence, {}),
        witnesses = Database.DecodeJson(row.witnesses, {}),
        internalNotes = Database.DecodeJson(row.internal_notes, {}),
        linkedVehicleIds = Database.DecodeJson(row.linked_vehicle_ids, {}),
    }
end

function RepositoryMappers.rowToWeapon(row)
    return {
        id = row.id,
        serialNumber = row.serial_number,
        type = row.type,
        caliber = row.caliber,
        ownerId = row.owner_id,
        licenseStatus = row.license_status,
        licenseExpiry = row.license_expiry,
        registeredAt = row.registered_at,
        notes = row.notes or '',
        isWanted = row.is_wanted == 1 or row.is_wanted == true,
    }
end

function RepositoryMappers.rowToVehicle(row)
    return {
        id = row.id,
        plate = row.plate,
        ownerId = row.owner_id,
        model = row.model,
        brand = row.brand,
        color = row.color,
        insuranceStatus = row.insurance_status,
        registrationStatus = row.registration_status,
        isWanted = row.is_wanted == 1 or row.is_wanted == true,
        linkedCaseIds = Database.DecodeJson(row.linked_case_ids, {}),
        registeredAt = row.registered_at,
    }
end

function RepositoryMappers.rowToWanted(row)
    return {
        id = row.id,
        type = row.type,
        targetId = row.target_id,
        targetName = row.target_name,
        priority = row.priority,
        description = row.description,
        lastKnownLocation = row.last_known_location,
        issuedAt = row.issued_at,
        active = row.active == 1 or row.active == true,
    }
end

function RepositoryMappers.rowToMessage(row)
    return {
        id = row.id,
        title = row.title,
        content = row.content,
        author = row.author,
        date = row.date,
        priority = row.priority,
    }
end

function RepositoryMappers.rowToAudit(row)
    return {
        id = row.id,
        timestamp = row.timestamp,
        officerId = row.officer_id,
        officerName = row.officer_name,
        action = row.action,
        module = row.module,
        details = row.details,
    }
end

