local Tunnel = module("vrp", "lib/Tunnel")
local Proxy = module("vrp", "lib/Proxy")
vRP = Proxy.getInterface("vRP")
vRPclient = Tunnel.getInterface("vRP","vRP")
local hasDataRecently = false
RegisterNetEvent(GetCurrentResourceName()..":requestVehicleData")
AddEventHandler(GetCurrentResourceName()..":requestVehicleData", function()
    local _source = source
        if hasDataRecently == false then
            exports.oxmysql:query('SELECT * FROM nfr_dealership', function(rows)
                if #rows == 0 then
                    print("There are no cars in the Database")
                else
                    print("There are cars")
                        exports.oxmysql:query('SELECT * FROM nfr_dealership', function(result)
                                TriggerClientEvent(GetCurrentResourceName()..":vehiclesData", _source, result)
                                hasDataRecently = true
                                Wait(2000)
                                hasDataRecently = false
                                return
                        end)
                end
            end)
        else 
            return
        end
    end
)