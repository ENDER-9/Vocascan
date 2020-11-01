import React, {useState} from 'react';
import InputField from '../Others/InputField/InputField.jsx';
import Dropdown from '../Others/Dropdown/Dropdown.jsx';
import languages from './Languages.js';
import './AddLanguagePackage.css';

function AddLanguagePackage(props) {
    var vocascan = require('bindings')('vocascan.node');

    const [name, setName] = useState('');
    const [foreignLanguage, setForeignLanguage] = useState('');
    const [translatedLanguage, setTranslatedLanguage] = useState('');
    const [vocabsPerDay, setVocabsPerDay] = useState(100);
    const [rightTranslations, setRightTranslations] = useState(2);

    function submitHandler() {
        vocascan.addLanguagePackage(name, foreignLanguage, translatedLanguage, vocabsPerDay, rightTranslations);
        props.function()
    }

    return (
        <form className="lngpckg">
            <label>
                <h3>Name</h3>
                <InputField placeholder="z.B. Englisch - Deutsch" function={e => { setName(e.target.value)}}/>
            </label>

            <div className="lngpckg-dropdown">
                <label className="lngpckg-dropdown-field">
                    Fremdsprache
                    <Dropdown title="Auswählen..." function={e => setForeignLanguage(e.target.value)} selection={languages} addField={true} addFieldFunction={e => console.log(e.target.value)}/>
                </label>
                <label className="lngpckg-dropdown-field">
                    Übersetzung
                    <Dropdown title="Auswählen..." function={e => setTranslatedLanguage(e.target.value)} selection={languages} addField={true} addFieldFunction={e => console.log(e.target.value)}/>
                </label>
            </div>

            <label>
                <h3>Vokabeln pro Tag</h3>
                <InputField placeholder="z.B. 100" function={e => setVocabsPerDay(e.target.value)}/>
            </label>

            <label>
                <h3>Richtige Übersetzungen um Vokabelpaar erfolgreich zu haben</h3>
                <InputField placeholder="z.B. 2" function={e => setRightTranslations(e.target.value)}/>
            </label>

            <button className="lngpckg-submitBtn" type="button" value="Submit" onClick={submitHandler}>Weiter</button>
        </form >
    );
}

export default AddLanguagePackage;