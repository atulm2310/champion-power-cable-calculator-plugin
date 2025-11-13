<div class="projectInformation three_boxes col-md-12 col-sm-12 col-xs-12">
    <h3 class="title">Cable Information</h3>
    <div class="information">

       


        <!-- Summary -->
        <div class="accordion" id="accordionExample">

            <!-- Phase -->
            <div class="accordion-item hide">
                <h2 class="accordion-header" id="headingOne">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                        Phase
                    </button>
                </h2>
                <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne"
                    data-bs-parent="#accordionExample">
                    <div class="accordion-body">
                        <div class="form-group">
                            <label for="information-cables">Cables</label>
                            <select class="form-control" min=1 name="information-phase-cables"
                                id="information-phase-cables">
                                <?php for ($i=0; $i <= 10; $i++) : ?>
                                <option value="<?= $i ?>"><?= $i ?></option>
                                <?php endfor; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="information-cu_al">CU/AL</label>
                            <select class="form-control required" name="information-phase-cu_al"
                                id="information-phase-cu_al">
                                <option value="">Select an option</option>
                                <option value="CU">CU</option>
                                <option value="AL">AL</option>
                            </select>
                        </div>
                        <div class="form-group v600">
                            <label for="information-type">Type</label>
                            <select class="form-control required" name="information-phase-type"
                                id="information-phase-type">
                                <option value="">Select an option</option>
                                <?php  foreach ($cableInputType as $k => $v) {
                                ?><option value="<?= $v["id"] ?>"><?= $v["name"] ?></option><?php 
                            } ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="information-size">Size</label>
                            <select class="form-control required" name="information-phase-size"
                                id="information-phase-size">
                                <option value="">Select an option</option>
                                <?php foreach ($cableInputSizes as $k => $v) {
                                ?><option value="<?= $k ?>"><?= $v ?></option><?php 
                            }  ?>
                            </select>
                        </div>
                        <div class="form-group regular">
                            <label for="information-ccCount">CC Count</label>
                            <select class="form-control required" name="information-phase-ccCount"
                                id="information-phase-ccCount">
                                <option value="">Select an option</option>
                                <option value="1/C">1/C</option>
                                <option value="3/C WG">3/C WG</option>
                                <option value="4/C WG">4/C WG</option>
                            </select>
                        </div>
                        <div class="form-group regular">
                            <label for="information-voltage">Voltage</label>
                            <input type="number" class="form-control required" id="information-phase-voltage"
                                name="information-phase-voltage" aria-label="Voltage">
                        </div>
                        <div class="form-group regular">
                            <label for="information-v_kv">V/kV</label>
                            <select class="form-control required" name="information-phase-v_kv"
                                id="information-phase-v_kv">
                                <option value="">Select an option</option>
                                <option value="v">V</option>
                                <option value="kv">kV</option>
                            </select>
                        </div>
                        <div class="form-group regular">
                            <label for="information-armor">Armor</label>
                            <select class="form-control required" name="information-phase-armor"
                                id="information-phase-armor">
                                <option value="">Select an option</option>
                                <?php foreach ($materialArmor as $k => $v) {
                                ?><option value="<?= $v["material"] ?>"><?= $v["material"] ?></option><?php 
                            } ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="information-jacket">Jacket</label>
                            <select class="form-control required" name="information-phase-jacket"
                                id="information-phase-jacket">
                                <option value="">Select an option</option>
                                <?php foreach ($jacketMaterial as $k => $v) {
                                ?><option value="<?= $v["material"] ?>"><?= $v["material"] ?></option><?php 
                            } ?>
                            </select>
                        </div>

                        <div class="form-group regular">
                            <label for="information-OD">O.D.</label>
                            <input type="number" class="form-control required" id="information-phase-OD"
                                name="information-phase-OD" aria-label="O.D.">
                        </div>

                        <div class="form-group regular">
                            <label for="information-Lbsft">Lbs/ft</label>
                            <input type="number" class="form-control required" id="information-phase-Lbsft"
                                name="information-phase-Lbsft" aria-label="Lbs/ft">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Neutral -->
            <div class="accordion-item v600">
                <h2 class="accordion-header" id="headingOne">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                        Neutral
                    </button>
                </h2>
                <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne"
                    data-bs-parent="#accordionExample">
                    <div class="accordion-body">
                        <div class="form-group">
                            <label for="information-cables">Cables</label>
                            <select class="form-control" min=1 name="information-neutral-cables"
                                id="information-neutral-cables">
                                <?php for ($i=0; $i <= 10; $i++) : ?>
                                <option value="<?= $i ?>"><?= $i ?></option>
                                <?php endfor; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="information-cu_al">CU/AL</label>
                            <select class="form-control required" name="information-neutral-cu_al"
                                id="information-neutral-cu_al">
                                <option value="">Select an option</option>
                                <option value="CU">CU</option>
                                <option value="AL">AL</option>
                            </select>
                        </div>
                        <div class="form-group v600">
                            <label for="information-type">Type</label>
                            <select class="form-control required" name="information-neutral-type"
                                id="information-neutral-type">
                                <option value="">Select an option</option>
                                <?php  foreach ($cableInputType as $k => $v) {
                                ?><option value="<?= $v["id"] ?>"><?= $v["name"] ?></option><?php 
                            } ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="information-size">Size</label>
                            <select class="form-control required" name="information-neutral-size"
                                id="information-neutral-size">
                                <option value="">Select an option</option>
                                <?php foreach ($cableInputSizes as $k => $v) {
                                ?><option value="<?= $k ?>"><?= $v ?></option><?php 
                            }  ?>
                            </select>
                        </div>
                        <div class="form-group regular">
                            <label for="information-ccCount">CC Count</label>
                            <select class="form-control required" name="information-neutral-ccCount"
                                id="information-neutral-ccCount">
                                <option value="">Select an option</option>
                                <option value="1/C">1/C</option>
                                <option value="3/C WG">3/C WG</option>
                                <option value="4/C WG">4/C WG</option>
                            </select>
                        </div>
                        <div class="form-group regular">
                            <label for="information-voltage">Voltage</label>
                            <input type="number" class="form-control required" id="information-neutral-voltage"
                                name="information-neutral-voltage" aria-label="Voltage">
                        </div>
                        <div class="form-group regular">
                            <label for="information-v_kv">V/kV</label>
                            <select class="form-control required" name="information-neutral-v_kv"
                                id="information-neutral-v_kv">
                                <option value="">Select an option</option>
                                <option value="v">V</option>
                                <option value="kv">kV</option>
                            </select>
                        </div>
                        <div class="form-group regular">
                            <label for="information-armor">Armor</label>
                            <select class="form-control required" name="information-neutral-armor"
                                id="information-neutral-armor">
                                <option value="">Select an option</option>
                                <?php foreach ($materialArmor as $k => $v) {
                                ?><option value="<?= $v["material"] ?>"><?= $v["material"] ?></option><?php 
                            } ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="information-jacket">Jacket</label>
                            <select class="form-control required" name="information-neutral-jacket"
                                id="information-neutral-jacket">
                                <option value="">Select an option</option>
                                <?php foreach ($jacketMaterial as $k => $v) {
                                ?><option value="<?= $v["material"] ?>"><?= $v["material"] ?></option><?php 
                            } ?>
                            </select>
                        </div>

                        <div class="form-group regular">
                            <label for="information-OD">O.D.</label>
                            <input type="number" class="form-control required" id="information-neutral-OD"
                                name="information-neutral-OD" aria-label="O.D.">
                        </div>

                        <div class="form-group regular">
                            <label for="information-Lbsft">Lbs/ft</label>
                            <input type="number" class="form-control required" id="information-neutral-Lbsft"
                                name="information-neutral-Lbsft" aria-label="Lbs/ft">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ground -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingTwo">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                        Ground
                    </button>
                </h2>
                <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo"
                    data-bs-parent="#accordionExample">
                    <div class="accordion-body">
                        <div class="form-group">
                            <label for="information-cables">Cables</label>
                            <select class="form-control required" name="information-ground-cables"
                                id="information-ground-cables">
                                <option value="">Select an option</option>
                                <?php for ($i=0; $i <= 10; $i++) : ?>
                                <option value="<?= $i ?>"><?= $i ?></option>
                                <?php endfor; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="information-cu_al">CU/AL</label>
                            <select class="form-control required" name="information-ground-cu_al"
                                id="information-ground-cu_al">
                                <option value="">Select an option</option>
                                <option value="CU">CU</option>
                                <option value="AL">AL</option>
                            </select>
                        </div>
                        <div class="form-group v600">
                            <label for="information-type">Type</label>
                            <select class="form-control required" name="information-ground-type"
                                id="information-ground-type">
                                <option value="">Select an option</option>
                                <?php  foreach ($cableInputType as $k => $v) {
                                ?><option value="<?= $v["id"] ?>"><?= $v["name"] ?></option><?php 
                            } ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="information-size">Size</label>
                            <select class="form-control required" name="information-ground-size"
                                id="information-ground-size">
                                <option value="">Select an option</option>
                                <?php foreach ($cableInputSizes as $k => $v) {
                                ?><option value="<?= $k ?>"><?= $v ?></option><?php 
                            }  ?>
                            </select>
                        </div>
                        <div class="form-group regular">
                            <label for="information-OD">O.D.</label>
                            <input type="number" class="form-control required" id="information-ground-OD"
                                name="information-ground-OD" aria-label="O.D.">
                        </div>

                        <div class="form-group regular">
                            <label for="information-Lbsft">Lbs/ft</label>
                            <input type="number" class="form-control required" id="information-ground-Lbsft"
                                name="information-ground-Lbsft" aria-label="Lbs/ft">
                        </div>

                    </div>
                </div>
            </div>
        </div>
        <br>
        <div class="form-group regular">
            <label for="" class="subtitle">Cable Notes</label>
            <div class="form-group regular">
                <label for="information-phase">Phase</label>
                <input type="text" class="form-control required" id="information-phase" name="information-phase"
                    aria-label="information-phase">
            </div>
            <div class="form-group regular">
                <label for="information-ground">Ground</label>
                <input type="text" class="form-control required" id="information-ground" name="information-ground"
                    aria-label="ground">
            </div>
        </div>
        <br>
        <div class="cable-summary form-group">
            <label for="" class="subtitle">Cable Summary</label><br>

            <div class="form-group col-md-12 hide" style="text-align:center;margin-bottom: 20px;">
                <img id="cableImage" src="" alt="">
            </div>

            <div class="form-group col-md-6 col-sm-6 no-padding">
                <label class="col-md-12 no-padding" for="">Total # of Cables:</label>
                <label class="col-md-12 no-padding" id="totalCables">0</label>
            </div>

            <div class="form-group col-md-6 col-sm-6 no-padding">
                <label class="col-md-12 no-padding" for="">Pull Configuration:</label>
                <label class="col-md-12 no-padding" id="pullConfiguration">0</label>
            </div>

            <div class="form-group col-md-6 col-sm-6 no-padding">
                <label class="col-md-12 no-padding" for="">Total Weight (lbs/ft):</label>
                <label class="col-md-12 no-padding" id="totalWeight">0</label>
            </div>

            <div class="form-group col-md-6 col-sm-6 no-padding">
                <label class="col-md-12 no-padding" for="">Weight Correction:</label>
                <label class="col-md-12 no-padding" id="weightCorrection">0</label>
            </div>
            <div class="form-group">
                <hr>
            </div>
        </div>
    </div>
</div>