<div class="projectInformation two_boxes col-xs-3">
    <h3 class="title">Project Overrides</h3>
    <button class="btn btn-primary actionButton" id="clearOverrides">Clear Overrides</button>
    <form class="information" id="overrides">
        <div class="form-group">
            <label for="override-coefficient-friction">Coefficient of Friction</label>
            <input type="number" class="form-control noRequired userFill formField" id="override-coefficient-friction"
                name="override-coefficient-friction" aria-label="pull-profile-cable"
                >
        </div>
        <div class="form-group">
            <label for="override-pull-configuration">Pull Configuration</label>
            <select id="override-pull-configuration" class="form-control noRequired userFill formField"
                name="override-pull-configuration">
                <option value="">Select an Option</option>
                <option value="Single">Single</option>
                <option value="Triangular">Triangular</option>
                <option value="Cradled">Cradled</option>
                <option value="Complex">Complex</option>
            </select>
        </div>
        <div class="form-group">
            <label for="override-maximum-pulling-limit">Maximum Pulling Limit (lbs)</label>
            <input type="number" class="form-control noRequired userFill formField" id="override-maximum-pulling-limit"
                name="override-maximum-pulling-limit" aria-label="override-maximum-pulling-limit"
                >
        </div>
        <div class="form-group">
            <label for="override-maximum-SWBP-limit">Maximum SWBP Limit (lbs)</label>
            <input type="number" class="form-control noRequired userFill formField" id="override-maximum-SWBP-limit"
                name="override-maximum-SWBP-limit" aria-label="override-maximum-SWBP-limit"
                >
        </div>
        <label for="">*Only use verified data in Overrides.</label>
        <hr>
        <label class="subtitle" for="">Notes</label>
        <div class="form-group">
            <ul>
                <li>Other factors that can affect coefficient of friction are Conduit fill, pulling speed, pressure,
                    temperature and instalation.</li>
                <li>Conduit is new and free of debris, dirt, sand or other contaminants.</li>
                <li>Coefficient of friction values are for Dynamic friction. Pulls should never be stopped and
                    restarted.
                </li>
                <li>CoF defaults are Non Lubricated.</li>
                <li>Dual Cable pulls use a conservative three-cable factor for weight correction.</li>
                <li>Consult cable and equipment manufacturer for proper pulling equipment.</li>
                <li>Consult applicable national standards, cable manufacturer or other supplier's.</li>
                <li>Variation of incoming tension will impact overall calculations</li>
            </ul>
        </div>
    </form>
</div>