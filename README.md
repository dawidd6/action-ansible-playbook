# Run Ansible playbook GitHub Action

An Action that executes given Ansible playbook on selected hosts.

Should work on any OS, if `ansible-playbook` command is available in `PATH`.

## Usage

```yaml
- name: Run playbook
  uses: dawidd6/action-ansible-playbook@v4
  with:
    # Required, playbook filepath
    playbook: deploy.yml
    # Optional, directory where playbooks live
    directory: ./
    # Optional, ansible configuration file content (ansible.cfg)
    configuration: |
      [defaults]
      callbacks_enabled = ansible.posix.profile_tasks, ansible.posix.timer
      stdout_callback = yaml
      nocows = false
    # Optional, SSH private key
    key: ${{secrets.SSH_PRIVATE_KEY}}
    # Optional, literal inventory file contents
    inventory: |
      [all]
      example.com

      [group1]
      example.com
    # Optional, SSH known hosts file content
    known_hosts: |
      example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
    # Optional, encrypted vault password
    vault_password: ${{secrets.VAULT_PASSWORD}}
    # Optional, galaxy requirements filepath
    requirements: galaxy-requirements.yml
    # Optional, additional flags to pass to ansible-playbook
    options: |
      --inventory .hosts
      --limit group1
      --extra-vars hello=there
      --verbose
```
