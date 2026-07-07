function Repository.CanViewEmployees(emp)
    return Repository.EmployeeHasPermission(emp, 'viewEmployees')
end

function Repository.CanManageEmployees(emp)
    return Repository.EmployeeHasPermission(emp, 'manageEmployees')
end

function Repository.CanManageRoles(emp)
    return Repository.EmployeeHasPermission(emp, 'manageRoles')
end

function Repository.CanManageSettings(emp)
    return Repository.EmployeeHasPermission(emp, 'adminFunctions')
end
