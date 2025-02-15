fx_version "adamant"
game "gta5"
dependency "vrp"
author "NFR#1824"
description "NFR HUDS."
shared_script "config.lua"

client_scripts {
    "@vrp/client/Proxy.lua",
    "@vrp/client/Tunnel.lua",
    "client/*.lua"
}

server_scripts {
    "@vrp/lib/utils.lua",
    "server/*.lua"
}
ui_page {
    "html/index.html"
}

files {
    "html/*.*",
    "html/icons/*.png",
    "html/vehicles/*.png"
}

export 'Notify'