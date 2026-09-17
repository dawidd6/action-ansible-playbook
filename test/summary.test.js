import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {
    stripAnsi,
    extractRecap,
    escapeForSummary,
    buildSummaryMarkdown,
    writeSummary
} from '../lib/summary.js'

test('stripAnsi removes color escape sequences', () => {
    const colored = '\u001b[0;32mok\u001b[0m: [localhost]'
    assert.equal(stripAnsi(colored), 'ok: [localhost]')
})

test('stripAnsi leaves plain text untouched', () => {
    const plain = 'plain text without ansi codes'
    assert.equal(stripAnsi(plain), plain)
})

test('escapeForSummary escapes HTML/Markdown-sensitive characters', () => {
    const input = '<script>alert("x")</script> & things > 1'
    assert.equal(
        escapeForSummary(input),
        '&lt;script&gt;alert("x")&lt;/script&gt; &amp; things &gt; 1'
    )
})

test('extractRecap finds a standard PLAY RECAP block', () => {
    const output = [
        'PLAY [all] *********************************************************',
        '',
        'TASK [Gathering Facts] *********************************************',
        'ok: [localhost]',
        '',
        'PLAY RECAP **********************************************************',
        'localhost                  : ok=1    changed=0    unreachable=0    failed=0'
    ].join('\n')

    const recap = extractRecap(output)
    assert.ok(recap.startsWith('PLAY RECAP'))
    assert.match(recap, /localhost.*ok=1/)
})

test('extractRecap finds a TASKS RECAP block', () => {
    const output = [
        'some earlier log line',
        'TASKS RECAP *********************************************************',
        'localhost                  : ok=2    changed=1    unreachable=0    failed=0'
    ].join('\n')

    const recap = extractRecap(output)
    assert.ok(recap.startsWith('TASKS RECAP'))
})

test('extractRecap strips ANSI colors before matching', () => {
    const output = [
        '\u001b[0;36mPLAY [all] ***\u001b[0m',
        '\u001b[0;33mPLAY RECAP ***\u001b[0m',
        '\u001b[0;32mlocalhost                  : ok=1    changed=0\u001b[0m'
    ].join('\n')

    const recap = extractRecap(output)
    assert.ok(recap.startsWith('PLAY RECAP'))
    assert.doesNotMatch(recap, /\u001b/)
})

test('extractRecap returns null when no recap block is present', () => {
    const output = 'just some log output with no recap section'
    assert.equal(extractRecap(output), null)
})

test('buildSummaryMarkdown reports success with recap', () => {
    const md = buildSummaryMarkdown({
        success: true,
        recap: 'PLAY RECAP ***\nlocalhost : ok=1'
    })
    assert.match(md, /Success/)
    assert.match(md, /<pre>/)
    assert.match(md, /PLAY RECAP/)
})

test('buildSummaryMarkdown reports failure with error text and recap', () => {
    const md = buildSummaryMarkdown({
        success: false,
        errorMessage: 'ansible-playbook returned code 2',
        recap: 'PLAY RECAP ***\nlocalhost : failed=1'
    })
    assert.match(md, /Failure/)
    assert.match(md, /ansible-playbook returned code 2/)
    assert.match(md, /failed=1/)
})

test('buildSummaryMarkdown notes missing recap plainly', () => {
    const md = buildSummaryMarkdown({ success: false, errorMessage: 'boom', recap: null })
    assert.match(md, /No recap block/)
})

test('buildSummaryMarkdown escapes HTML/Markdown-sensitive content', () => {
    const md = buildSummaryMarkdown({
        success: false,
        errorMessage: '<img src=x onerror=alert(1)>',
        recap: null
    })
    assert.doesNotMatch(md, /<img/)
    assert.match(md, /&lt;img/)
})

test('writeSummary appends a bounded section to the summary file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'summary-test-'))
    const summaryFile = path.join(dir, 'summary.md')
    fs.writeFileSync(summaryFile, '')

    writeSummary({
        success: true,
        output: 'PLAY RECAP ***\nlocalhost : ok=1',
        summaryFile
    })

    const content = fs.readFileSync(summaryFile, 'utf8')
    assert.match(content, /Ansible Playbook/)
    assert.match(content, /PLAY RECAP/)

    fs.rmSync(dir, { recursive: true, force: true })
})

test('writeSummary does nothing when no summary file is provided', () => {
    // Should not throw even though there is nothing to write to.
    assert.doesNotThrow(() => writeSummary({ success: true, output: '', summaryFile: undefined }))
})

test('writeSummary reports errors via onError without throwing', () => {
    let reported = null
    assert.doesNotThrow(() => writeSummary({
        success: true,
        output: '',
        summaryFile: '/nonexistent-directory/summary.md',
        onError: (err) => { reported = err }
    }))
    assert.ok(reported)
})
