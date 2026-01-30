import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as yaml from 'yaml'
import * as fs from 'node:fs'
import * as os from 'node:os'

async function main() {
    try {
        const playbook = core.getInput("playbook", { required: true })
        const requirements = core.getInput("requirements")
        const directory = core.getInput("directory")
        const configuration = core.getInput("configuration")
        const key = core.getInput("key")
        const inventory = core.getInput("inventory")
        const vaultPassword = core.getInput("vault_password")
        const knownHosts = core.getInput("known_hosts")
        const options = core.getInput("options")
        const sudo    = core.getBooleanInput("sudo")
        const noColor = core.getBooleanInput("no_color")
        const checkMode = core.getBooleanInput("check_mode")
        const fileMode = 0o600

        let cmd = ["ansible-playbook", playbook]

        if (options) {
            cmd.push(options.replace(/\n/g, " "))
        }

        if (directory) {
            process.chdir(directory)
            core.saveState("directory", directory)
        }

        if (configuration) {
            const ansibleConfigurationFile = "ansible.cfg"
            fs.writeFileSync(ansibleConfigurationFile, configuration, { mode: fileMode })
            core.saveState("ansibleConfigurationFile", ansibleConfigurationFile)
        }

        if (requirements) {
            const requirementsContent = fs.readFileSync(requirements, 'utf8')
            const requirementsObject = yaml.parse(requirementsContent)

            if (Array.isArray(requirementsObject)) {
                await exec.exec("ansible-galaxy", ["install", "-r", requirements])
            } else {
                if (requirementsObject.roles)
                    await exec.exec("ansible-galaxy", ["role", "install", "-r", requirements])
                if (requirementsObject.collections)
                    await exec.exec("ansible-galaxy", ["collection", "install", "-r", requirements])
            }
        }

        if (key) {
            const keyFile = ".ansible_key"
            fs.writeFileSync(keyFile, key + os.EOL, { mode: fileMode })
            core.saveState("keyFile", keyFile)
            cmd.push("--key-file")
            cmd.push(keyFile)
        }

        if (inventory) {
            const inventoryFile = ".ansible_inventory"
            fs.writeFileSync(inventoryFile, inventory, { mode: fileMode })
            core.saveState("inventoryFile", inventoryFile)
            cmd.push("--inventory")
            cmd.push(inventoryFile)
        }

        if (vaultPassword) {
            const vaultPasswordFile = ".ansible_vault_password"
            fs.writeFileSync(vaultPasswordFile, vaultPassword, { mode: fileMode })
            core.saveState("vaultPasswordFile", vaultPasswordFile)
            cmd.push("--vault-password-file")
            cmd.push(vaultPasswordFile)
        }

        if (knownHosts) {
            const knownHostsFile = ".ansible_known_hosts"
            fs.writeFileSync(knownHostsFile, knownHosts, { mode: fileMode })
            core.saveState("knownHostsFile", knownHostsFile)
            cmd.push(`--ssh-common-args="-o UserKnownHostsFile=${knownHostsFile}"`)
            process.env.ANSIBLE_HOST_KEY_CHECKING = "True"
        } else {
            process.env.ANSIBLE_HOST_KEY_CHECKING = "False"
        }

        if (sudo) {
            cmd.unshift("sudo", "-E", "env", `PATH=${process.env.PATH}`)
        }

        if (noColor) {
            process.env.ANSIBLE_NOCOLOR = "True"
        } else {
            process.env.ANSIBLE_FORCE_COLOR = "True"
        }

        if (checkMode) {
            cmd.push("--check")
        }

        let output = ""
        await exec.exec(cmd.join(' '), null, {
          listeners: {
            stdout: function(data) {
              output += data.toString()
            },
            stderr: function(data) {
              output += data.toString()
            }
          }
        })
        core.setOutput("output", output)
    } catch (error) {
        core.setFailed(error.message)
    }
}

main()
