#!/bin/sh

key="$SSH_PUBLIC_KEY"

if test -z "$key"; then
    echo "set SSH_PUBLIC_KEY environment variable first"
    exit 1
fi

echo "$key" > /etc/ssh/authorized_keys

exec /usr/sbin/sshd -D
