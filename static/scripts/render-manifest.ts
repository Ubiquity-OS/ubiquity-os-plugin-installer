export class ManifestRenderer {
    manifestGui: HTMLElement | null;
    manifestGuiBody: HTMLElement | null;
    decodedManifest: { [key: string]: any };

    constructor(decodedManifest: { [key: string]: any }) {
        this.manifestGui = document.querySelector(`#manifest-gui`);
        this.manifestGuiBody = document.querySelector(`#manifest-gui-body`);
        this.decodedManifest = decodedManifest;
        this.renderManifest();
    }

    renderManifest() {
        this.manifestGui?.classList.add("rendering");
        const decodedManifest = this.decodedManifest;

        const dfg = document.createDocumentFragment();
        const _div = document.createElement("DIV");
        const _nestedObject = document.createElement("pre");
        // const _h3 = document.createElement("h3");

        /**
         * name": "Start | Stop",
         * description": "Assign or un-assign yourself from an issue.",
         * ubiquity:listeners": [
         * commands": {
         */

        const decodedManifestKeys = Object.keys(decodedManifest);
        let x = -1;
        const limit = decodedManifestKeys.length;
        // const buffer = [];
        const _tableRow = document.createElement("tr");
        const _tableDataHeader = document.createElement("td");
        _tableDataHeader.className = "table-data-header";
        const _tableDataValue = document.createElement("td");
        _tableDataValue.className = "table-data-value";
        _tableRow.appendChild(_tableDataHeader);
        _tableRow.appendChild(_tableDataValue);

        while (++x < limit) {
            const tableRow = _tableRow.cloneNode(true) as HTMLTableRowElement;
            const key = decodedManifestKeys[x];
            tableRow.id = key;
            let rawValue = decodedManifest[key];
            let isString = true;
            if (typeof rawValue !== "string") {
                const prettified = JSON.stringify(decodedManifest[key], null, 2);
                let humanize = prettified.replace(/\{|\}|\[|\]/igm, ``);
                humanize = humanize.replace(/ubiquity:/igm, ``);
                humanize = humanize.replace(/": "/igm, ` ➡️ `);
                humanize = humanize.replace(/",?$/igm, ``);
                humanize = humanize.replace(/^\s\s\s\s"/igm, `      `);
                humanize = humanize.replace(/^\s\s"/igm, `   `);
                humanize = humanize.replace(/":/igm, ``);
                humanize = humanize.replace(/^\s\s,/igm, ``);
                rawValue = humanize;
                isString = false;
            }
            const valueParsed = rawValue;
            const keyDiv = _div.cloneNode() as HTMLDivElement;
            keyDiv.textContent = key.replace("ubiquity:", "");

            // h3.id = `key-${key}`;
            const valueDiv = _div.cloneNode() as HTMLDivElement;
            if (isString) {
                valueDiv.textContent = valueParsed;
            } else {
                const nestedObject = _nestedObject.cloneNode() as HTMLPreElement;
                nestedObject.textContent = valueParsed;
                valueDiv.appendChild(nestedObject);
            }
            // div.id = `value-${key}`;
            tableRow.children[0].appendChild(keyDiv);
            tableRow.children[1].appendChild(valueDiv);
            dfg.appendChild(tableRow);
        }

        this.manifestGuiBody?.appendChild(dfg);
        this.manifestGui?.classList.add("rendered");
    }
}