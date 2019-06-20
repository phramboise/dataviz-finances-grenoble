import React from 'react';

import DownloadIcon from '../../../../../images/icons/download.svg';

export default function({dataUrl, sourceCodeUrl}){
    const nbsp = '\u00A0';

    return <footer className="w-files" aria-labelledby="w-files-heading">
        <h3 id="w-files-heading" className="w-files__title">Télécharger les données en Open{nbsp}Data</h3>
        <ul className="w-files__links">
            <li>
                <a href={dataUrl} target="_blank" rel="noopener">
                    <DownloadIcon className="icon" />
                    Données brutes des comptes administratifs (norme comptable M14)
                </a>
            </li>
            <li>
                <a href={sourceCodeUrl} target="_blank" rel="noopener">
                    <DownloadIcon className="icon" />
                    Code source de cet outil d'exploration
                </a>
            </li>
        </ul>
    </footer>;
}
