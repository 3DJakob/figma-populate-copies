# Populate copies

Populate copies is a Figma plugin for generating populated component instances from spreadsheet data. It inspects the selected component, displays its exposed properties, suggests matching spreadsheet columns, and creates one populated copy per data row.

## Features

- Inspect exposed component properties from the current Figma selection.
- Import `.csv` and `.xlsx` files through drag and drop or file browsing.
- Preview the imported headers and records before creating copies.
- Suggest mappings when a spreadsheet column and component property have the same name.
- Map spreadsheet columns to text, boolean, and other editable component properties.
- Keep the original instance in place and arrange generated copies horizontally.

## Run in Figma

1. Open Figma Desktop.
2. Choose **Plugins → Development → Import plugin from manifest…**.
3. Select [`manifest.json`](./manifest.json).
4. Select a component instance with exposed properties.
5. Drop in a CSV or Excel file, or click the drop zone to browse.
6. Review the suggested mappings and choose **Populate copies**.

The plugin uses the first worksheet in an Excel workbook. The first row is treated as the header row, and each following row becomes one new component instance.

## Example

Given a component property named `property_a` and a spreadsheet with matching headers:

```text
property_a,property_b
value_1,value_2
value_3,value_4
```

The plugin suggests:

```text
property_a → property_a
```

After confirmation, it creates one copy for each spreadsheet row and applies the mapped values to the matching component properties.

## Project files

- `manifest.json` — Figma plugin manifest.
- `code.js` — Figma main-thread logic for selection inspection and instance creation.
- `ui.html` — Plugin UI, file import, preview, matching, and mapping controls.

## Current limitations

- Population requires selecting a component instance. Selecting a component definition shows its properties but cannot create populated instances directly.
- Only the first worksheet in an Excel workbook is imported.
- Generated copies are arranged in a horizontal row from the original instance.
- The Excel parser is loaded from jsDelivr when the plugin UI opens.
