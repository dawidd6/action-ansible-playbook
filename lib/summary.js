import * as fs from 'node:fs'

// Matches ANSI/VT100 escape sequences (color codes, cursor movement, etc.)
// eslint-disable-next-line no-control-regex
const ANSI_PATTERN = /\x1B(?:\[[0-9;?]*[a-zA-Z]|\][^\x07]*\x07|[@-Z\\-_])/g

/**
 * Strips ANSI escape sequences (e.g. color codes) from a string.
 */
export function stripAnsi(str) {
    return (str || "").replace(ANSI_PATTERN, "")
}

/**
 * Escapes text so it can be safely embedded inside Markdown/HTML,
 * in particular inside a <pre> block in a GitHub Step Summary.
 */
export function escapeForSummary(str) {
    return (str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}

/**
 * Extracts the Ansible recap block from raw (possibly ANSI-colored) output.
 * Looks for a line starting with "TASKS RECAP" or "PLAY RECAP" and returns
 * everything from that line to the end of the output, trimmed.
 * Returns null when no recap block is present.
 */
export function extractRecap(output) {
    const clean = stripAnsi(output || "")
    const match = clean.match(/^(?:TASKS RECAP|PLAY RECAP)[^\n]*\n(?:.*\n?)*/m)
    return match ? match[0].trim() : null
}

/**
 * Builds the Markdown for the job summary section describing the
 * outcome of the Ansible playbook run.
 */
export function buildSummaryMarkdown({ success, errorMessage, recap }) {
    let md = "## Ansible Playbook\n\n"
    md += success ? "**Status:** :white_check_mark: Success\n\n" : "**Status:** :x: Failure\n\n"

    if (!success && errorMessage) {
        md += "### Error\n\n<pre>\n" + escapeForSummary(errorMessage) + "\n</pre>\n\n"
    }

    if (recap) {
        md += "### Recap\n\n<pre>\n" + escapeForSummary(recap) + "\n</pre>\n\n"
    } else {
        md += "_No recap block (`TASKS RECAP`/`PLAY RECAP`) was found in the output._\n\n"
    }

    return md
}

/**
 * Appends an Ansible summary section to the given GitHub Step Summary file.
 * Never throws: any failure while writing the summary is swallowed (and
 * reported through the optional `onError` callback) so it never conceals
 * the original Ansible success/failure result.
 */
export function writeSummary({ success, errorMessage, output, summaryFile, onError }) {
    if (!summaryFile) {
        return
    }

    try {
        const recap = extractRecap(output)
        const markdown = buildSummaryMarkdown({ success, errorMessage, recap })
        fs.appendFileSync(summaryFile, markdown + "\n")
    } catch (summaryError) {
        if (onError) {
            onError(summaryError)
        }
    }
}
