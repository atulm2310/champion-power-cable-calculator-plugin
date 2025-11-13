<div id="cableInformation" class="projectInformation col-xs-6 disabled">
    <h3 class="title">Cable Information</h3>
    <button class="btn btn-primary actionButton" id="clearCables">Clear Cables</button>
    <form id="cablesForm" class="information">

        <!-- Phase -->
        <div class="form-group singleLine table">
            <label class="">Phase</label>
            <table class="col-md-12 no-padding">
                <tr>
                    <th># Cables</th>
                    <th>CU/AL</th>
                    <th class="v600">Type</th>
                    <th>Size</th>
                    <th class="regular">CC Count</th>
                    <th class="regular">Voltage</th>
                    <th class="regular">V/kV</th>
                    <th class="regular">Armor</th>
                    <th>Jacket</th>
                    <th>O.D.</th>
                    <th>Lbs/ft</th>
                </tr>
                <tr>
                    <td>
                        <!-- # Cables -->
                        <select class="form-control userFill required phaseSection formField" min=1
                            name="information-phase-cables" id="information-phase-cables">
                            <option value=""></option>
                            <?php for ($i = 0; $i <= 10; $i++): ?>
                                <option value="<?= $i ?>"><?= $i ?></option>
                            <?php endfor; ?>
                        </select>
                    </td>
                    <td>
                        <!-- CU/AL -->
                        <select class="form-control userFill required phaseSection formField"
                            name="information-phase-cu_al" id="information-phase-cu_al">
                            <option value=""></option>
                            <option value="CU">CU</option>
                            <option value="AL">AL</option>
                        </select>
                    </td>
                    <th class="v600">
                        <select class="form-control userFill required phaseSection formField"
                            name="information-phase-type" id="information-phase-type">
                            <option value=""></option>
                            <?php foreach ($cableInputType as $k => $v) {
                                ?>
                                <option value="<?= $v["id"] ?>"><?= $v["name"] ?></option>
                                <?php
                            } ?>
                        </select>
                    </th>
                    <td>
                        <!-- Size -->
                        <select class="form-control userFill required phaseSection formField"
                            name="information-phase-size" id="information-phase-size">
                            <option value=""></option>
                            <?php foreach ($cableInputSizes as $k => $v) {
                                ?>
                                <option value="<?= $k ?>"><?= $v ?></option>
                                <?php
                            } ?>
                        </select>
                    </td>
                    <td class="regular">
                        <!-- CC Count -->
                        <select class="form-control userFill required phaseSection formField"
                            name="information-phase-ccCount" id="information-phase-ccCount">
                            <option value=""></option>
                            <option value="1/C">1/C</option>
                            <option value="3/C WG">3/C WG</option>
                            <option value="4/C WG">4/C WG</option>
                        </select>
                    </td>
                    <td class="regular">
                        <!-- Voltage -->
                        <input type="number" class="form-control userFill required phaseSection formField"
                            id="information-phase-voltage" name="information-phase-voltage" aria-label="Voltage">
                    </td>
                    <td class="regular">
                        <!-- V/kV -->
                        <select class="form-control userFill required phaseSection formField"
                            name="information-phase-v_kv" id="information-phase-v_kv">
                            <option value=""></option>
                            <option value="v">V</option>
                            <option value="kv">kV</option>
                        </select>
                    </td>
                    <td class="regular">
                        <!-- Armor -->
                        <select class="form-control userFill required phaseSection formField"
                            name="information-phase-armor" id="information-phase-armor">
                            <option value=""></option>
                            <?php foreach ($materialArmor as $k => $v) {
                                ?>
                                <option value="<?= $v["material"] ?>"><?= $v["material"] ?></option>
                                <?php
                            } ?>
                        </select>
                    </td>
                    <td>
                        <!-- Jacket -->
                        <select class="form-control userFill required phaseSection formField"
                            name="information-phase-jacket" id="information-phase-jacket">
                            <option value=""></option>
                            <?php foreach ($jacketMaterial as $k => $v) {
                                ?>
                                <option value="<?= $v["material"] ?>"><?= $v["material"] ?></option>
                                <?php
                            } ?>
                        </select>
                    </td>
                    <td>
                        <!-- O.D. -->
                        <input type="number" class="form-control required userFill formField" id="information-phase-OD"
                            name="information-phase-OD" aria-label="O.D.">
                    </td>
                    <td>
                        <!-- Lbs/ft -->
                        <input type="number" class="form-control required userFill formField"
                            id="information-phase-Lbsft" name="information-phase-Lbsft" aria-label="Lbs/ft">
                    </td>
                </tr>
            </table>
        </div>

        <!-- Neutral -->
        <div class="form-group singleLine table">
            <label class="subtitle v600">Neutral</label>
            <table class="col-md-12 no-padding v600">
                <tr>
                    <!-- # Cables -->
                    <td> <select class="form-control userFill noRequired formField neutralSection" min=1
                            name="information-neutral-cables" id="information-neutral-cables">
                            <option value=""></option>
                            <?php for ($i = 0; $i <= 10; $i++): ?>
                                <option value="<?= $i ?>"><?= $i ?></option>
                            <?php endfor; ?>
                        </select></td>

                    <td>
                        <!-- CU/AL -->
                        <select class="form-control userFill  noRequired formField neutralSection"
                            name="information-neutral-cu_al" id="information-neutral-cu_al">
                            <option value=""></option>
                            <option value="CU">CU</option>
                            <option value="AL">AL</option>
                        </select>
                    </td>
                    <td>
                        <!-- Type -->
                        <select class="form-control userFill  noRequired formField neutralSection"
                            name="information-neutral-type" id="information-neutral-type">
                            <option value=""></option>
                            <?php foreach ($cableInputType as $k => $v) {
                                ?>
                                <option value="<?= $v["id"] ?>"><?= $v["name"] ?></option>
                                <?php
                            } ?>
                        </select>
                    </td>
                    <td>
                        <!-- Size -->
                        <select class="form-control userFill  noRequired formField neutralSection"
                            name=" information-neutral-size" id="information-neutral-size">
                            <option value=""></option>
                            <?php foreach ($cableInputSizes as $k => $v) {
                                ?>
                                <option value="<?= $k ?>"><?= $v ?></option>
                                <?php
                            } ?>
                        </select>
                    </td>
                    <td class="regular">
                        <!-- CC Count -->
                        <select class="form-control userFill required formField neutralSection"
                            name="information-neutral-ccCount" id="information-neutral-ccCount">
                            <option value=""></option>
                            <option value="1/C">1/C</option>
                            <option value="3/C WG">3/C WG</option>
                            <option value="4/C WG">4/C WG</option>
                        </select>
                    </td>
                    <td class="regular">
                        <!-- Voltage -->
                        <input type="number" class="form-control userFill formField noRequired"
                            id="information-neutral-voltage" name="information-neutral-voltage" aria-label="Voltage">
                    </td>
                    <td class="regular">
                        <!-- V/kV -->
                        <select class="form-control userFill  noRequired" name="information-neutral-v_kv"
                            id="information-neutral-v_kv">
                            <option value=""></option>
                            <option value="v">V</option>
                            <option value="kv">kV</option>
                        </select>
                    </td>
                    <td class="regular">
                        <!-- Armor -->

                        <select class="form-control userFill formField noRequired" name="information-neutral-armor"
                            id="information-neutral-armor">
                            <option value=""></option>
                            <?php foreach ($materialArmor as $k => $v) {
                                ?>
                                <option value="<?= $v["material"] ?>"><?= $v["material"] ?></option>
                                <?php
                            } ?>
                        </select>
                    </td>
                    <td>
                        <!-- Jacket -->
                        <select class="form-control userFill formField noRequired" name="information-neutral-jacket"
                            id="information-neutral-jacket">
                            <option value=""></option>
                            <?php foreach ($jacketMaterial as $k => $v) {
                                ?>
                                <option value="<?= $v["material"] ?>"><?= $v["material"] ?></option>
                                <?php
                            } ?>
                        </select>
                    </td>
                    <td>
                        <!-- O.D. -->
                        <input type="number" class="form-control formField userFill noRequired"
                            id="information-neutral-OD" name="information-neutral-OD" aria-label="O.D.">
                    </td>
                    <td>
                        <!-- Lbs/ft -->
                        <input type="number" class="form-control formField userFill  noRequired"
                            id="information-neutral-Lbsft" name="information-neutral-Lbsft" aria-label="Lbs/ft">
                    </td>
                </tr>
            </table>
        </div>

        <!-- Ground -->
        <div class="form-group singleLine table ground">
            <label class="">Ground</label>
            <table class="col-md-12 no-padding">
                <tr>
                    <td>
                        <!-- Cables -->
                        <select class="form-control userFill noRequired formField groundSection"
                            name="information-ground-cables" id="information-ground-cables">
                            <option value=""></option>
                            <?php for ($i = 0; $i <= 10; $i++): ?>
                                <option value="<?= $i ?>"><?= $i ?></option>
                            <?php endfor; ?>
                        </select>
                    </td>
                    <td>
                        <!-- CU/AL -->
                        <select class="form-control userFill noRequired formField groundSection"
                            name="information-ground-cu_al" id="information-ground-cu_al">
                            <option value=""></option>
                            <option value="CU">CU</option>
                            <option value="AL">AL</option>
                        </select>
                    </td>
                    <td class="v600">
                        <!-- Type -->
                        <select class="form-control userFill noRequired formField groundSection"
                            name="information-ground-type" id="information-ground-type">
                            <option value=""></option>
                            <?php foreach ($cableInputType as $k => $v) {
                                ?>
                                <option value="<?= $v["id"] ?>"><?= $v["name"] ?></option>
                                <?php
                            } ?>
                        </select>
                    </td>
                    <td>
                        <!-- Size -->
                        <select class="form-control userFill noRequired formField groundSection"
                            name="information-ground-size" id="information-ground-size">
                            <option value=""></option>
                            <?php foreach ($cableInputSizes as $k => $v) {
                                ?>
                                <option value="<?= $k ?>"><?= $v ?></option>
                                <?php
                            } ?>
                        </select>
                    </td>
                    <td class="regular ">
                        <!-- CC Count -->
                        <select class="form-control userFill noRequired groundSection formField"
                            name="information-ground-ccCount" id="information-ground-ccCount">
                            <option value=""></option>
                            <option value="1/C">1/C</option>
                            <option value="3/C WG">3/C WG</option>
                            <option value="4/C WG">4/C WG</option>
                        </select>
                    </td>
                    <td class="regular">
                        <!-- Voltage -->
                        <input type="number" class="form-control userFill noRequired groundSection formField"
                            id="information-ground-voltage" name="information-ground-voltage" aria-label="Voltage">
                    </td>
                    <td class="regular">
                        <!-- V/kV -->
                        <select class="form-control userFill noRequired groundSection formField"
                            name="information-ground-v_kv" id="information-ground-v_kv">
                            <option value=""></option>
                            <option value="v">V</option>
                            <option value="kv">kV</option>
                        </select>
                    </td>
                    <td class="regular">
                        <!-- Armor -->
                        <select class="form-control userFill noRequired groundSection formField"
                            name="information-ground-armor" id="information-ground-armor">
                            <option value=""></option>
                            <?php foreach ($materialArmor as $k => $v) {
                                ?>
                                <option value="<?= $v["material"] ?>"><?= $v["material"] ?></option>
                                <?php
                            } ?>
                        </select>
                    </td>
                    <td class="">
                        <!-- Jacket -->
                        <select class="form-control userFill noRequired groundSection formField"
                            name="information-ground-jacket" id="information-ground-jacket">
                            <option value=""></option>
                            <?php foreach ($jacketMaterial as $k => $v) {
                                ?>
                                <option value="<?= $v["material"] ?>"><?= $v["material"] ?></option>
                                <?php
                            } ?>
                        </select>
                    </td>
                    <td>
                        <!-- O.D. -->
                        <input type="number" class="form-control userFill noRequired formField"
                            id="information-ground-OD" name="information-ground-OD" aria-label="O.D.">
                    </td>
                    <td>
                        <!-- Lbs/ft -->
                        <input type="number" class="form-control userFill noRequired formField"
                            id="information-ground-Lbsft" name="information-ground-Lbsft" aria-label="Lbs/ft">
                    </td>
                </tr>
            </table>
        </div>

        <div class="form-group col-md-12">

            <div class="cable-summary form-group col-md-8">
                <label for="" class="subtitle">Cable Summary</label><br>

                <div class="form-group col-md-10 col-sm-10 no-padding">
                    <div class="form-group col-md-6 col-sm-6 no-padding">
                        <label class="no-padding" for="">Total # of Cables: </label>
                        <label class="no-padding formField" id="totalCables">0</label>
                    </div>

                    <div class="form-group col-md-6 col-sm-6 no-padding">
                        <label class=" no-padding  " for="">Pull Configuration:</label>
                        <label class=" no-padding formField" id="pullConfiguration">0</label>
                    </div>

                    <div class="form-group col-md-6 col-sm-6 no-padding">
                        <label class=" no-padding  " for="">Total Weight (lbs/ft):</label>
                        <label class=" no-padding formField" id="totalWeight">0</label>
                    </div>

                    <div class="form-group col-md-6 col-sm-6 no-padding">
                        <label class=" no-padding  " for="">Weight Correction:</label>
                        <label class=" no-padding formField" id="weightCorrection">0</label>
                    </div>
                </div>

                <div class="form-group col-md-2 hide">
                    <img id="cableImage" src="" alt="">
                </div>


            </div>
            <div class="form-group regular col-md-4">
                <label for="" class="subtitle">Cable Notes</label>
                <div class="form-group  singleLine regular">
                    <label for="information-phase">Phase</label>
                    <input type="text" class="form-control userFill formField noRequired" id="information-phase"
                        name="information-phase" aria-label="information-phase">
                </div>
                <div class="form-group  singleLine regular">
                    <label for="information-ground">Ground</label>
                    <input type="text" class="form-control userFill formField noRequired" id="information-ground"
                        name="information-ground" aria-label="ground">
                </div>
            </div>
        </div>
    </form>
</div>