local isDealershipOpen = false
local resultData = nil
local hasDataRecently = false
vehicle = nil
spawnedVehs = {}
local shown = false
local isTestDriving = false
local pedLastCoords = nil
local finished = false
Citizen.CreateThread(function()
    function SetDisplay(bool)
        display = bool
        isDealershipOpen = bool
        SetNuiFocus(bool, bool)
        SendNUIMessage(
            {
                type = "ui",
                status = bool
            }
        )
    end
end
)

cam = nil
RegisterNetEvent(GetCurrentResourceName()..":vehiclesData")
AddEventHandler(GetCurrentResourceName()..":vehiclesData", function(result)
    print("Cars have been recieved and saved in Client")
    resultData = result 
    SendNUIMessage({type = "vehiclesData", result = result}) 
    SetEntityVisible(PlayerPedId(), 0)
    cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", 0)
    SetCamCoord(cam, -47.22252, -1102.964, 27.25)
    SetCamRot(cam, 195.5, 180.00, 142.50, 2)
    SetCamActive(cam, true)
    RenderScriptCams(true, true, 1)
    SetNuiFocus(1, 1)
    DisplayRadar(0)
    SetDisplay(true)
    hasDataRecently = true
    Wait(2050)
    hasDataRecently = false
end)

function destroyCam()
    if DoesCamExist(cam) then
        DestroyCam(cam, true)
        RenderScriptCams(false, true, 1)
        cam = nil
    end
end


RegisterNUICallback("exit", function()
    if display then
        SetDisplay(false)
        isDealershipOpen = false
        DisplayRadar(1)
        SetNuiFocus(0, 0)
        destroyCam()
        SetEntityVisible(PlayerPedId(), 1)
        deleteLastCar() 
    end
end)
function NearBank()
    local pos = GetEntityCoords(GetPlayerPed(-1))
    local dist = GetDistanceBetweenCoords(-32.87677, -1112.69, 26.42237, pos.x, pos.y, pos.z, true)

    if dist <= 1.5 then
        return true
    end
end
Citizen.CreateThread(function()
	local inRange = false
    local _source = source
    while true do
    	inRange = false
        Citizen.Wait(0)
        if NearBank() and not isDealershipOpen and NearBank() then
            	inRange = true

            if IsControlJustReleased(0, 38) then
                if hasDataRecently == false then
                    TriggerServerEvent(GetCurrentResourceName()..":requestVehicleData")
                else
                    print("stop trying")
                end
            end
        elseif NearBank() then
        	Citizen.Wait(300)
        else
        	Citizen.Wait(1000)
        end

        if inRange and not shown then
        	shown = true
            exports['nfr_textui']:Show('E', 'Pentru a deschide meniul')
        elseif not inRange and shown then
        	shown = false
            exports['nfr_textui']:Hide()
        end

    end
end)

RegisterNUICallback("showCar", function(data, cb) showCar(data.name, data.vehicleType) end)
 
function deleteLastCar() 
    for i,v in pairs(spawnedVehs) do
       if DoesEntityExist(v) then
          DeleteEntity(v)
       end
       table.remove(spawnedVehs, i)
    end
    if DoesEntityExist(vehicle) then
        DeleteEntity(vehicle)
        vehicle = nil
    end
end
 
function showCar(modelName, vehicleType)
    local model = (type(modelName) == 'number' and modelName or GetHashKey(modelName))
	Citizen.CreateThread(function()
 
        deleteLastCar()

		local modelHash = model
        modelHash = (type(modelHash) == 'number' and modelHash or GetHashKey(modelHash))

        if not HasModelLoaded(modelHash) and IsModelInCdimage(modelHash) then
            RequestModel(modelHash)
    
            while not HasModelLoaded(modelHash) do
                Citizen.Wait(1)
            end
        end

        if vehicleType == 'helicopter' then
            destroyCam() 
            cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", 0)
            SetCamCoord(cam, 26.79712, -1064.856, 38.8004)
            SetCamRot(cam, -1.731844, 0.05433571, 104.8597, 2)
            SetCamActive(cam, true)
            RenderScriptCams(true, true, 1)
            vehicle = CreateVehicle(model, vector4(15.98405, -1066.266, 38.04987, 250.4391), false, false)
            table.insert(spawnedVehs, vehicle)
            local timeout = 0
            changeCarColor(255, 255, 255)
            SetEntityAsMissionEntity(vehicle, true, false)
            SetVehicleHasBeenOwnedByPlayer(vehicle, true)
            SetVehicleNeedsToBeHotwired(vehicle, false)
            SetVehRadioStation(vehicle, 'OFF')
            SetModelAsNoLongerNeeded(model)
            RequestCollisionAtCoord(-724.3783, -1443.638, 4.899543)
        else
            SetCamCoord(cam, -47.22252, -1102.964, 27.25)
            SetCamRot(cam, 195.5, 180.00, 142.50, 2)
            vehicle = CreateVehicle(model, vector4(-42.83338, -1098.685, 25.96589, 115.9196), false, false)
            table.insert(spawnedVehs, vehicle)
            local timeout = 0
            changeCarColor(255, 255, 255)
            SetEntityAsMissionEntity(vehicle, true, false)
            SetVehicleHasBeenOwnedByPlayer(vehicle, true)
            SetVehicleNeedsToBeHotwired(vehicle, false)
            SetVehRadioStation(vehicle, 'OFF')
            SetModelAsNoLongerNeeded(model)
            RequestCollisionAtCoord(-42.83338, -1098.685, 25.96589)
        end
		while not HasCollisionLoadedAroundEntity(vehicle) and timeout < 2000 do
			Citizen.Wait(0)
			timeout = timeout + 1
		end

		if cb then
			cb(vehicle)
		end
	end)
end



RegisterNUICallback("rotateCar", function(data, cb) rotateCar(data.direction) end)

function rotateCar(direction)
   if direction == "left" then
        if vehicle and DoesEntityExist(vehicle) then
            SetEntityRotation(vehicle, GetEntityRotation(vehicle) - vector3(0,0,4), false, false, 2, false)
        end
   elseif direction == "right" then
        if vehicle and DoesEntityExist(vehicle) then
            SetEntityRotation(vehicle, GetEntityRotation(vehicle) + vector3(0,0,4), false, false, 2, false)
        end
    end
end

RegisterNUICallback("changeCarColor", function(data, cb) changeCarColor(data.red, data.green, data.blue) end)

function changeCarColor(r, g, b)
    if vehicle and DoesEntityExist(vehicle) then
        SetVehicleCustomPrimaryColour(vehicle, r, g, b)
    end
end

RegisterNUICallback("startTestDrive", function(data, cb) startTestDrive() end)
RegisterNUICallback("endTestDrive", function(data, cb) endTestDrive() end)
function startTestDrive()
    finished = false
    CreateThread(function()
        if isTestDriving then
            return
        end
        isTestDriving = true
        if vehicle and DoesEntityExist(vehicle) then
            SetEntityVisible(PlayerPedId(), 1)
            DisplayRadar(1)
            SetNuiFocus(0, 0)
            destroyCam()
            SetEntityVisible(PlayerPedId(), 1)
            FreezeEntityPosition(vehicle,false)
            SetVehicleUndriveable(vehicle,false)
            SetPedIntoVehicle(PlayerPedId(), vehicle, -1)
            SetPedCoordsKeepVehicle(PlayerPedId(), -1974.016, 2863.956, 32.34936)
        end
            while not finished do
                if GetVehiclePedIsIn(PlayerPedId(), false) == 0 and DoesEntityExist(vehicle) then
                    endTestDrive()
                end
                Wait(1000)
            end

    end)
    return
end

function endTestDrive()
    
    SetPedCoordsKeepVehicle(PlayerPedId(), vector4(-42.83338, -1098.685, 25.96589, 115.9196))
    FreezeEntityPosition(vehicle, true)
    SetVehicleUndriveable(vehicle, true)
    ClearPedTasksImmediately(PlayerPedId())
    SetEntityCoords(PlayerPedId(), -32.87677, -1112.69, 26.42237)
    finished = true
    isTestDriving = false
    SendNUIMessage({type = "testDriveEnded"}) 
    SetEntityVisible(PlayerPedId(), 0)
    cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", 0)
    SetCamCoord(cam, -47.22252, -1102.964, 27.25)
    SetCamRot(cam, 195.5, 180.00, 142.50, 2)
    SetCamActive(cam, true)
    RenderScriptCams(true, true, 1)
    SetNuiFocus(1, 1)
    DisplayRadar(0)
    deleteLastCar() 
end




RegisterCommand('car', function(source, args, rawCommand)
    local x,y,z = table.unpack(GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0.0, 8.0, 0.5))
    local veh = args[1]
    if veh == nil then veh = "adder" end
    vehiclehash = GetHashKey(veh)
    RequestModel(vehiclehash)
    
    Citizen.CreateThread(function() 
        local waiting = 0
        while not HasModelLoaded(vehiclehash) do
            waiting = waiting + 100
            Citizen.Wait(100)
            if waiting > 5000 then
                ShowNotification("~r~Could not load the vehicle model in time, a crash was prevented.")
                break
            end
        end
        CreateVehicle(vehiclehash, x, y, z, GetEntityHeading(PlayerPedId())+90, 1, 0)
    end)
end)

-- Shows a notification on the player's screen 
function ShowNotification( text )
    SetNotificationTextEntry("STRING")
    AddTextComponentSubstringPlayerName(text)
    DrawNotification(false, false)
end
