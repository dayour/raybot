---
id: map
title: Screenshot map
sidebar_label: Screenshot map
---

# Screenshot map

The full crosswalk between the 41 curated captures and the original numbered captures they were
renamed from, plus the 35 originals that were superseded and not carried forward.

Source: `screenshot-map.md` in the source repository.

## Why two naming schemes exist

The originals were captured in chronological order as the build progressed: `01-agent-named-raybot.png`
through `76-dialog-add-microsoft-iq.png`. Numbered by the order they happened.

The curated set is renumbered and renamed by **phase and purpose**:
`NN_<phase>_<subject>.png`. Numbered by the order a reader needs them.

Those two orderings are not the same. Capture 25 chronologically — `25-build-with-logo.png` — is the
final Build canvas, which belongs at position 4 in a reader's sequence. Capture 76 is the Add
Microsoft IQ dialog, which belongs at position 18.

The rename exists because the build order and the explanation order diverged, and reading the runbook
against chronological filenames meant constant jumping.

## The curated 41

| # | Curated name | Phase | Caption | Original |
| --- | --- | --- | --- | --- |
| 01 | `01_build_agent_create.png` | build | Create agent; name set to Raybot | `01-agent-named-raybot.png` |
| 02 | `02_build_instructions.png` | build | System instructions authored | `02-instructions-entered.png` |
| 03 | `03_build_saved.png` | build | Agent saved | `03-agent-saved.png` |
| 04 | `04_build_canvas_final.png` | build | Build canvas with custom icon and config panel | `25-build-with-logo.png` |
| 05 | `05_knowledge_add-dialog.png` | knowledge | Add knowledge dialog | `05-knowledge-dialog.png` |
| 06 | `06_knowledge_url-entered.png` | knowledge | `docs.ray.io` URL entered | `06-knowledge-rayurl-added.png` |
| 07 | `07_knowledge_advanced.png` | knowledge | Knowledge advanced options | `08-knowledge-advanced-tab.png` |
| 08 | `08_knowledge_attached.png` | knowledge | Knowledge source attached | `07-knowledge-attached.png` |
| 09 | `09_tools_featured.png` | tools | Add tool, Featured tab | `57-tools-featured.png` |
| 10 | `10_tools_mcp.png` | tools | Add tool, MCP tab | `58-tools-mcp.png` |
| 11 | `11_tools_connectors.png` | tools | Add tool, Connectors tab | `59-tools-connectors.png` |
| 12 | `12_tools_workflows.png` | tools | Add tool, Workflows tab | `60-tools-workflows.png` |
| 13 | `13_tools_add-menu.png` | tools | Add tool, custom Add menu | `61-tools-add-custom-menu.png` |
| 14 | `14_tools_add-mcp-server-form.png` | tools | Add tool, new MCP server form | `62-tools-add-mcp-server-form.png` |
| 15 | `15_skills_add-dialog.png` | skills | Add skill dialog | `09-skills-dialog.png` |
| 16 | `16_skills_form.png` | skills | Skill form filled | `12-skill-form-filled.png` |
| 17 | `17_skills_created.png` | skills | Skill created and attached | `13-skill-created.png` |
| 18 | `18_iq_add-dialog.png` | iq | Add Microsoft IQ dialog | `76-dialog-add-microsoft-iq.png` |
| 19 | `19_iq_foundry-connection.png` | iq | Microsoft IQ, Foundry connection | `26-microsoft-iq-foundry-connection.png` |
| 20 | `20_iq_select-kb.png` | iq | Foundry IQ, select knowledge base | `27-foundryiq-select-kb-empty.png` |
| 21 | `21_iq_attached.png` | iq | Microsoft IQ `raybot-kb` attached | `28-microsoft-iq-attached.png` |
| 22 | `22_iq_verified-preview.png` | iq | IQ grounding verified in Preview | `29-microsoft-iq-verified-preview.png` |
| 23 | `23_connected_add-dialog.png` | connected | Add connected agent dialog | `17-connected-agents-dialog.png` |
| 24 | `24_memory_enabled.png` | memory | Memory toggle enabled | `18-memory-enabled.png` |
| 25 | `25_settings_agent-details.png` | settings | Settings, Agent details tab | `69-dialog-settings-agent-details.png` |
| 26 | `26_settings_ai-behavior.png` | settings | Settings, AI and behavior tab | `70-dialog-settings-ai-behavior.png` |
| 27 | `27_settings_moderation-options.png` | settings | Moderation level options | `52-moderation-level-options.png` |
| 28 | `28_settings_safety-access.png` | settings | Settings, Safety and access tab | `71-dialog-settings-safety-access.png` |
| 29 | `29_settings_authentication-options.png` | settings | Authentication options | `54-authentication-options.png` |
| 30 | `30_settings_web-channel-security.png` | settings | Web channel security | `55-web-channel-security.png` |
| 31 | `31_settings_greeting-prompts.png` | settings | Settings, Greeting and prompts tab | `72-dialog-settings-greeting-prompts.png` |
| 32 | `32_publish_inline.png` | publish | Inline publish from the command bar | `19-publishing.png` |
| 33 | `33_publish_published-state.png` | publish | Published state | `36-published-state.png` |
| 34 | `34_preview_chat.png` | preview | Preview chat surface | `73-preview-main.png` |
| 35 | `35_evaluate_test-set.png` | evaluate | Evaluate test set, 6Q | `74-evaluate-main.png` |
| 36 | `36_evaluate_csv-imported.png` | evaluate | Test cases imported from CSV | `30-eval-csv-imported.png` |
| 37 | `37_evaluate_results.png` | evaluate | Evaluation results grid, 0 percent | `32-eval-results-fallback.png` |
| 38 | `38_monitor_dashboard.png` | monitor | Monitor analytics dashboard | `75-monitor-main.png` |
| 39 | `39_teams_icon-uploaded.png` | teams | Teams channel icon uploaded | `33-teams-icon-uploaded.png` |
| 40 | `40_teams_publish-acp-blocked.png` | teams | Teams publish blocked, ACP consent | `49-save-failed-acp-consent.png` |
| 41 | `41_teams_search-no-result.png` | teams | Teams search, Raybot not listed | `45-teams-builtfororg-no-raybot.png` |

## The 35 superseded originals

Retained in `screenshots/` but not carried into the curated set. Each was intermediate, duplicate, or
replaced by a cleaner capture of the same thing.

| Original | Why superseded |
| --- | --- |
| `04-microsoft-iq-dialog.png` | Replaced by `76-dialog-add-microsoft-iq.png` |
| `10-tools-featured.png` | Replaced by `57-tools-featured.png` |
| `11-tools-mcp-tab.png` | Replaced by `58-tools-mcp.png` |
| `14-tools-connectors-tab.png` | Replaced by `59-tools-connectors.png` |
| `15-tools-workflows-tab.png` | Replaced by `60-tools-workflows.png` |
| `16-microsoft-iq-foundry.png` | Replaced by `26-microsoft-iq-foundry-connection.png` |
| `20-preview-response.png` | Superseded by `73-preview-main.png` |
| `21-evaluate-tab.png` | Superseded by `74-evaluate-main.png` |
| `22-monitor-tab.png` | Superseded by `75-monitor-main.png` |
| `23-evaluate-conversation-editor.png` | Intermediate state |
| `24-evaluate-configured.png` | Intermediate state |
| `31-eval-running.png` | Transient in-progress state |
| `34-edit-details-current.png` | Intermediate state |
| `35-after-publish.png` | Superseded by `36-published-state.png` |
| `37-icon-uploaded-fresh.png` | Duplicate of `33-teams-icon-uploaded.png` |
| `38-teams-launcher.png` | Teams navigation context |
| `39-teams-webapp-loading.png` | Loading state |
| `40-teams-webapp-loading.png` | Loading state, duplicate |
| `41-teams-loaded.png` | Teams navigation context |
| `42-teams-home.png` | Teams navigation context |
| `43-teams-tab2.png` | Teams navigation context |
| `44-teams-search-raybot.png` | Superseded by `45-teams-builtfororg-no-raybot.png` |
| `46-cps-tab0.png` | Navigation context |
| `47-edit-details-panel.png` | Intermediate state |
| `48-icon-uploaded-checkboxes-checked.png` | Intermediate state |
| `50-settings-agent-details.png` | Replaced by `69-dialog-settings-agent-details.png` |
| `51-settings-ai-behavior.png` | Replaced by `70-dialog-settings-ai-behavior.png` |
| `53-settings-safety-access.png` | Replaced by `71-dialog-settings-safety-access.png` |
| `56-greeting-prompts.png` | Replaced by `72-dialog-settings-greeting-prompts.png` |
| `63-dialog-add-knowledge.png` | Replaced by `05-knowledge-dialog.png` |
| `64-dialog-add-knowledge-advanced.png` | Replaced by `08-knowledge-advanced-tab.png` |
| `65-dialog-add-skill-upload.png` | Alternate entry mode, not used |
| `66-dialog-add-skill-blank.png` | Replaced by `09-skills-dialog.png` |
| `67-dialog-add-connected-agent.png` | Replaced by `17-connected-agents-dialog.png` |
| `68-dialog-add-microsoft-iq.png` | Replaced by `76-dialog-add-microsoft-iq.png` |

## The three gallery counts

41 is not the only count in circulation. Three exist, and all three are correct for their own scope:

| Count | Scope |
| --- | --- |
| 67 | Every capture in `gallery.json`, including Phase 7 |
| 41 | The curated set on this page |
| 38 | Images verified HTTP 200 in the `darbot-validation` run |

The 67 figure includes the 2026-06-17 Phase 7 workflow-designer captures, which postdate this map and
were never folded into the curated numbering. The 38 figure is the subset the validation harness
actually fetched.

Recorded in the [errata](../reference/errata.md) rather than resolved, because each number answers a
different question.

## A wording ambiguity in the source

`screenshot-map.md` line 4 reads:

> Originals are also preserved in `screenshots/` (01-62 numbered captures); this set is the curated
> rename.

That sentence was written **before** the 2026-06-17 move, when the curated set lived in the root and
the originals lived in `screenshots/`. After the move both sets are in `screenshots/`, so the sentence
is now technically true but no longer distinguishes anything.

The parenthetical "01-62" is also narrower than reality — originals run to 76.

Both are tracked in the [errata](../reference/errata.md).
