import * as core from '@actions/core'
import fs from 'fs'

function rm(file) {
    if (fs.existsSync(file)) {
        core.info(`Deleting "${file}" file`)
        fs.unlinkSync(file)
    }
}

async function main() {
    try {
        const directory = core.getState("directory")
        const ansibleConfigurationFile = core.getState("ansibleConfigurationFile")
        const keyFile = core.getState("keyFile")
        const inventoryFile = core.getState("inventoryFile")
        const vaultPasswordFile = core.getState("vaultPasswordFile")
        const knownHostsFile = core.getState("knownHostsFile")

        if (directory)
            process.chdir(directory)
        
        if (ansibleConfigurationFile)
            rm(ansibleConfigurationFile)

        if (keyFile)
            rm(keyFile)

        if (inventoryFile)
            rm(inventoryFile)

        if (vaultPasswordFile)
            rm(vaultPasswordFile)

        if (knownHostsFile)
            rm(knownHostsFile)

    } catch (error) {
        core.setFailed(error.message)
    }
}

main()
