const core = require('@actions/core')
const exec = require('@actions/exec')
const fs = require('fs')
const os = require('os')
const path = require('path')

async function main() {
    try {
        const playbook = core.getInput("playbook", { required: true })
        const directory = core.getInput("directory")
        const key = core.getInput("key")
        const inventory = core.getInput("inventory")
        const vaultPassword = core.getInput("vault_password")
        const options = core.getInput("options")

        let cmd = ["ansible-playbook", playbook]

        if (options) {
            cmd.push(options.replace("\n", " "))
        }

        if (directory) {
            process.chdir(directory)
        }

        if (key) {
            const keyFile = ".ansible_key"
            fs.writeFileSync(keyFile, key + os.EOL, { mode: 0600 })
            cmd.push("--key-file")
            cmd.push(keyFile)
        }

        if (inventory) {
            const inventoryFile = ".ansible_inventory"
            fs.writeFileSync(inventoryFile, inventory, { mode: 0600 })
            cmd.push("--inventory-file")
            cmd.push(inventoryFile)
        }

        if (vaultPassword) {
            const vaultPasswordFile = ".ansible_vault_password"
            fs.writeFileSync(vaultPasswordFile, vaultPassword, { mode: 0600 })
            cmd.push("--vault-password-file")
            cmd.push(vaultPasswordFile)
        }

        process.env.ANSIBLE_HOST_KEY_CHECKING = "False"
        process.env.ANSIBLE_FORCE_COLOR = "True"

        await exec.exec(cmd.join(" "))
    } catch (error) {
        core.setFailed(error.message)
    }
}

main()
