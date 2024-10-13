/* SPDX-License-Identifier: GPL-3.0
 * TapeVault
 *
 * folder.js
 *
 * COPYRIGHT NOTICE
 * Copyright (C) 2024 0x4248 and contributors
 * This file and software is licenced under the GNU General Public License v3.0. 
 * Redistribution of this file and software is permitted under the terms of the 
 * GNU General Public License v3.0. 
 *
 * NO WARRANTY IS PROVIDED WITH THIS SOFTWARE. I AM NOT RELIABLE FOR ANY DAMAGES.
 * THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY AND LIABILITY OF ANY KIND.
 *
 * You should have received a copy of the GNU General Public License v3.0
 * along with this program. If you have not please see the following link:
 * https://www.gnu.org/licenses/gpl-3.0.html
*/


document.addEventListener("DOMContentLoaded", async function () {
    const path = window.location.pathname;
    const folder = decodeURIComponent(path.split('/folder/').pop());

    document.getElementById("folder-title").textContent = `Folder: /${folder}`;

    const subfoldersResponse = await fetch(`/api/folders/${folder}`);
    const subfolders = await subfoldersResponse.json();

    const subfoldersList = document.getElementById("subfolders");
    if (subfolders.length === 0) {
        subfoldersList.innerHTML = "<i class='bi bi-ban' style='color:red;margin-right:10px;'></i> No subfolders";
    } else {
        subfolders.forEach(subfolder => {
            const subfolderDiv = document.createElement("div");
            subfolderDiv.className = "subfolder";

            const icon = document.createElement("p");
            icon.className = "folder-icon";
            icon.innerHTML = '<i class="bi bi-folder-fill"></i>';
            subfolderDiv.appendChild(icon);

            const link = document.createElement("p");
            link.className = "folder-link";
            const linkAnchor = document.createElement("a");
            linkAnchor.href = `/folder/${subfolder[0]}`;
            linkAnchor.textContent = subfolder[1];
            link.appendChild(linkAnchor);
            subfolderDiv.appendChild(link);

            subfoldersList.appendChild(subfolderDiv);
        });
    }

    const archivesResponse = await fetch(`/api/index/${folder}`);
    const archives = await archivesResponse.json();

    const archivesList = document.getElementById("archives");
    if (archives.length === 0) {
        archivesList.innerHTML = "<i class='bi bi-ban' style='color:red;margin-right:10px;'></i> No archives";
    } else {
        archives.forEach(archive => {
            const archiveDiv = document.createElement("div");
            archiveDiv.className = "archive";

            const icon = document.createElement("p");
            icon.className = "archive-icon";
            icon.innerHTML = '<i class="bi bi-floppy-fill"></i>';
            archiveDiv.appendChild(icon);

            const details = document.createElement("div");

            const uuid = archive[0];
            const title = archive[1];
            const dateArchive = archive[2];
            const dateModified = archive[3];
            const fileType = archive[6];

            const link = document.createElement("p");
            link.className = "archive-link";
            const linkAnchor = document.createElement("a");
            linkAnchor.href = `/archive/${uuid}`;
            linkAnchor.textContent = title;
            link.appendChild(linkAnchor);
            details.appendChild(link);

            const date = document.createElement("p");
            date.className = "archive-date";
            date.textContent = `Archived on: ${dateArchive}`;
            details.appendChild(date);

            const type = document.createElement("p");
            type.className = "archive-type";
            type.textContent = `Type: ${fileType}`;
            details.appendChild(type);

            archiveDiv.appendChild(details);
            archivesList.appendChild(archiveDiv);
        });
    }
});
