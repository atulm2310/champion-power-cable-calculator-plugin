<div id="projectInputs" class="projectInformation col-xs-3">
    <h3 class="title">Project Inputs</h3>
    <div class="information">
        <div class="form-group singleLine">
            <label for="raceway">Raceway</label>
            <select class="form-control userFill formField " name="raceway" id="raceway">
                <option value="">Select an Option</option>
                <?php
                foreach ($racewayTypes as $k => $v) {
                    ?>
                        <option value="<?= $v["id"] ?>"><?= $v["name"] ?></option>
                    <?php
                }
                ?>
            </select>
        </div>
        <div class="form-group singleLine halfSize">
            <label for="tradeSize">Trade Size</label>
            <select class="form-control userFill formField " name="tradeSize" id="tradeSize">
                <option value="">Select an Option</option>
                <?php
                foreach ($sizes as $k => $v) {
                    ?>
                    <option value="<?= $v ?>"><?= $v ?></option>
                    <?php
                }
                ?>
            </select>
        </div>
        <div class="form-group singleLine halfSize">
            <label for="conduitType">Conduit Type</label>
            <input type="hidden" id="conduitCode" name="conduitCode" value="">
            <select class="form-control userFill formField " name="conduitType" id="conduitType">
                <option value="">Select an Option</option>
                <?php
                foreach ($conduitTypes as $k => $v) {
                    ?>
                       <option value="<?= $k ?>"><?= $v ?></option>
                    <?php
                }
                ?>
            </select>
        </div>
        <div class="form-group singleLine">
            <label id="minimumTrade" class="fullSize formField">NEC Minimum Trade Size - </label>
        </div>

        <div class="form-group singleLine">
            <label for="incoming-tension">Incoming Tension (lbs)</label>
            <input type="text" class="form-control  userFill required formField" id="incoming-tension"
                name="incoming-tension" aria-label="incoming-tension">
        </div>

        <label for="" class="subtitle">Project Notes</label>
        <div class="form-group singleLine">
            <label for="grip-type">Grip Type</label>
            <input type="text" class="form-control  userFill formField noRequired" id="grip-type" name="grip-type"
                aria-label="grip-type">
        </div>

        <div class="form-group singleLine">
            <label for="lubricant">Lubricant</label>
            <input type="text" class="form-control userFill formField noRequired" id="lubricant" name="lubricant"
                aria-label="lubricant">
        </div>

    </div>
</div>