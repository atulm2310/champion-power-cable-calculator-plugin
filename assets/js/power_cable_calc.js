jQuery(document).ready(function ($) {
    // Utility functions
    function isEmpty(val) {
        return val === undefined || val === null || val === '';
    }

    // Main calculator object
    window.pullCalculator = {
        mainUrl: $("#mainUrl").val() + "/",
        themeUrl: $("#themeUrl").val() + "/",
        totalCableArea: 0,
        pullConfiguration: null,
        pullConfigurationALT: null,
        CFIconduitSize: null,
        tradeSize: null,
        pipetype: null,
        raceway: null,
        ajaxAsync: true,
        _ajax: null,
        _ajaxgetWeightCorrection: null,
        _ajaxgetPipeTypes: null,
        _ajaxgetSizes: null,
        _ajaxgetCableInputSizes: null,
        _ajaxmin_nec_fill: null,
        _ajaxSegments: null,
        _ajaxgetConduitID: null,
        _ajaxpowercablesaveData: null,
        _ajaxGet_OD_LBS: null,
        maxReverseTensions: 0,
        weightCorrectionBase: null,
        weightCorrection: null,
        weightCorrectionBaseALT: null,
        weightCorrectionALT: null,
        totalWeight: null,
        ftWeight: null,
        totallengthOfBend: 0,
        totallengthOfBend_v600: 0,
        totalLength: 0,
        coefficient_of_friction: null,
        coefficient_of_friction_v600: null,
        segment: 1,
        coefficient_of_friction_column: 2,
        cablesSum: 0,
        sumTension: 0,
        sumTensionALT: 0,
        sumTension_v600: 0,
        ECoF: 0,
        directions: null,
        reverse: null,
        jamProbabilityList: null,
        CC_Cnt: "THHN",
        sumLengths: 0,
        laborHours: 0,
        laborHoursExtra: 0,
        ElbowLaborHours: 0,
        ElbowLaborHoursExtra: 0,
        maximunSupportDistance: 0,
        maximunSupportDistanceExtra: 0,
        supportDistance: 0,
        supportDistanceExtra: 0,
        cableFault: "Cable Fault",
        comparisonCable: 0,
        comparisonCableExtra: 0,
        inProgress: null,
        run: 0,
        regularSegments: null,
        reverseSegments: null,
        maxSWBP: 0,
        maximumPullingLimit: 0,
        minmaximumPullingLimit: 0,
        minimumTrade: 0,
        toastEl: null,
        loadDataId: null,
        response_ID: null,
        response_ID_v600: null,
        calculatedSegments: null,
        maxLength: 0,
        cancelCalculations: false,
        debug: false,
        segmentChangeTimeout: null,
        calculatingTimeout: 3, // 3 seconds
        // Initialization function
        init: function () {
            $("#powerCalculatorContainer")
                .closest(".container")
                .addClass("calculatorFullWidth");

            // Jam probability list
            pullCalculator.jamProbabilityList = {
                0: "Very Small",
                2.4: "Small",
                2.5: "Moderate",
                2.6: "Significant",
                2.9: "Moderate",
                3.0: "Small",
                3.2: "Very Small"
            };

            // Initialize datepicker
            $(".timepicker").datepicker();

            //Project inputs field change event
            $("#projectInputs #raceway")
                .off()
                .on("change", function () {
                    pullCalculator
                        .racewayChange()
                        .then(function () {
                            // Explicitly call getSizes() here
                            pullCalculator
                                .getSizes()
                                .then(function () {
                                    pullCalculator
                                        .getPullConfiguration()
                                        .then(function () {
                                            pullCalculator.calculateSegments();
                                        });
                                });
                        });
                });
            // $("#projectInputs #raceway")
            //     .off()
            //     .on("change", function () {
            //         //get racewayType
            //         pullCalculator
            //             .racewayChange()
            //             .then(function () {
            //                 pullCalculator
            //                     .getPullConfiguration()
            //                     .then(function () {
            //                         pullCalculator.calculateSegments();
            //                     });
            //             });
            //     });

            $("#projectInputs #conduitType")
                .off()
                .on("change", function () {
                    pullCalculator
                        .getPullConfiguration()
                        .then(function () {
                            pullCalculator.calculateSegments();
                        });
                });

            // Raceway form change event
            $("#cablesForm .formField")
                .off()
                .on("change", function () {
                    pullCalculator.getPullConfiguration();
                });

            // Cable input size change event
            $("#information-type")
                .off()
                .on("change", pullCalculator.cableInputSizeChange);

            pullCalculator
                .addSegment(18)
                .done(function () {
                    $(
                        "#powerCalculatorContainer input:not(.userFill), #powerCalculatorContainer sele" +
                        "ct:not(.userFill)"
                    ).addClass("disabled");

                    $(".seg_1 [name='segment-build-list-begin-segment']").remove();

                    /* To Load */
                    //if url has id
                    var url = new URL(window.location.href);
                    var id = url
                        .searchParams
                        .get("id");
                    if (id != null) {
                        pullCalculator.loadDataId = id;
                        pullCalculator.loadData(id);
                    }

                    jQuery(".open_option").select2({tags: true});
                });

            /* Change Coeficient of friction */
            // Coefficient of friction override event
            $("#override-coefficient-friction").on("change", function () {
                const value = $(this).val();
                const $friction = $("#pull-profile-coefficient-friction");
                if (isEmpty(value) || value == 0) {
                    $friction
                        .parent()
                        .removeClass("redText");
                } else {
                    $friction
                        .parent()
                        .addClass("redText");
                    $friction.text(value + " *Override");
                }
                pullCalculator.coefficient_of_friction = value;
            });

            // Pull configuration override event
            $("#override-pull-configuration").on("change", function () {
                const value = $(this).val();
                pullCalculator.pullConfiguration = value;
                const $weightCorrection = $("#pull-profile-weight-correction");
                const $configuration = $("#pull-profile-configuration");
                if (isEmpty(value) || value == 0) {
                    $weightCorrection
                        .parent()
                        .removeClass("redText");
                    $configuration
                        .parent()
                        .removeClass("redText");
                    $("#weightCorrection").text($("#weightCorrection").attr("data-original"));
                } else {
                    $weightCorrection
                        .parent()
                        .addClass("redText");
                    let tmp = $weightCorrection.text();
                    $weightCorrection.text(tmp + " *Override");
                    $("#weightCorrection").text(tmp + " *Override");
                    $configuration
                        .parent()
                        .addClass("redText");
                    tmp = $configuration.text();
                    $configuration.text(tmp + " *Override");
                }
                pullCalculator
                    .getPullConfiguration()
                    .done(function () {
                        //pullCalculator.calculateSegments();
                    });
            });

            pullCalculator.checkFields();

            /* Reverse Segments */
            // Change segments direction event
            $("#changeSegmentsDirection").on("click", function () {
                //if pullCalculator.regularSegments is empty call getsegments
                if (pullCalculator.regularSegments === null) {
                    pullCalculator.getSegments(false);
                } else {
                    pullCalculator.changeSegmentsOrder();
                }

                pullCalculator.displaySegments();
            });

            // Clear segment list event
            $("#clearList").on("click", function () {
                $("#segmentBuildList").trigger("reset");
                $("#segmentBuildList td label")
                    .removeClass("redText")
                    .text("");
                $("#segmentBuildList td input")
                    .removeClass("redText")
                    .val("");
                $("[name='segment-build-list-tension'], [name='segment-build-list-SWBP']").removeClass(
                    "override"
                );

                //pullCalculator.calculateSegments();
            });

            // Clear cables event
            $("#clearCables").on("click", function () {
                $("#cablesForm").trigger("reset");
                //pullCalculator.calculateSegments();
            });

            // Clear overrides event
            $("#clearOverrides").on("click", function () {
                $("#overrides").trigger("reset");
                pullCalculator.coefficient_of_friction = "";
                $("#pull-profile-coefficient-friction")
                    .parent()
                    .removeClass("redText");
                //pullCalculator.calculateSegments();
            });

            // Export to PDF event
            $("#toPDF").on("click", function () {
                pullCalculator.printPDF();
            });

            /* To Save */
            // Save data event
            $("#toSave").on("click", function () {
                pullCalculator.saveData();
            });

            /* To clear all */
            // Clear all event
            $("#toClearAll").on("click", function () {
                pullCalculator.clearAll();
            });

            /* Hide Other fiels */
            // Hide fields depending on mode
            if ($("#_mode").val() == "regular") {
                $("table.v600 input, table.v600 select").attr("disabled", true);
                $(".v600 > input, .v600 > select").attr("disabled", true);
                $(".table.ground .regular > *").attr("disabled", true);
            } else {
                $("table.regular input, table.regular select").attr("disabled", true);
                $(".regular > input, .regular > select").attr("disabled", true);
            }

            //recalculate on toCalculate click
            $(document).on("click", "#toCalculate", function () {
                clearTimeout(pullCalculator.segmentChangeTimeout);
                pullCalculator.getSegments(false, "array");
                pullCalculator.calculateSegments();
            });

            // update on any field Debounce handler to avoid multiple calls on rapid changes
            $(document).on("change", "#segmentBuildList .userFill", function (e) {

                var _tmp = $(this);
                // Debounce changeSegmentsOrder to avoid multiple calls Show toast with
                // countdown timer (500ms interval, counting down)
                let seconds = pullCalculator.calculatingTimeout;
                let toastId = "od-lbs-timer-toast";

                $.toast({
                    heading: "Information",
                    text: `Recalculating in <span id="${toastId}">${seconds}s</span>`,
                    icon: "info",
                    hideAfter: true,
                    stack: true,
                    position: "bottom-left"
                });

                // Start a countdown timer that updates the toast and triggers calculation after
                // 5 intervals (2.5s)
                function startCountdown() {

                    const value = _tmp.val();
                    //get class of tr parent
                    const parentClass = _tmp
                        .closest("tr")
                        .attr("class");
                    //remove seg_ from parentClass
                    const number = parseInt(parentClass.replace("seg_", ""));
                    //get field name
                    const fieldName = _tmp.attr("name");
                    var reverse = $("#changeSegmentsDirection").hasClass("reverse");
                    var array = (reverse)
                        ? (
                            Array.isArray(pullCalculator.reverseSegments)
                                ? pullCalculator.reverseSegments
                                : []
                        ).map(seg => Object.assign({}, seg))
                        : (
                            Array.isArray(pullCalculator.regularSegments)
                                ? pullCalculator.regularSegments
                                : []
                        ).map(seg => Object.assign({}, seg));

                    //if pullCalculator.regularSegments[number - 1] not exist create it
                    if (!array[number - 1]) {
                        array[number - 1] = {};
                    }

                    // Update both arrays regardless of direction
                    var position = (reverse)
                        ? array.length - 1
                        : number - 1;

                    array[position][fieldName] = value;

                    let countdown = seconds;
                    function tick() {
                        countdown--;
                        $("#" + toastId).text((countdown) + "s");
                        if (countdown <= 0) {
                            pullCalculator.segmentChangeTimeout = null;
                            pullCalculator.getSegments(false, array);
                            pullCalculator.calculateSegments();
                        } else {
                            pullCalculator.segmentChangeTimeout = setTimeout(tick, 1000);
                        }
                    }

                    // Clear any previous timer before starting a new one
                    if (pullCalculator.segmentChangeTimeout) {
                        clearTimeout(pullCalculator.segmentChangeTimeout);
                    }
                    pullCalculator.segmentChangeTimeout = setTimeout(tick, 1000);
                }
                startCountdown();
            });

            //if focus is on any field inside #segmentBuildList and enter key is pressed
            $("#segmentBuildList").on("keydown", "input, select", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    //move to the field below get the index td on tr
                    const currentIndex = $(this)
                        .closest("tr")
                        .find("td")
                        .index($(this).closest("td"));
                    $(this)
                        .closest("tr")
                        .next()
                        .find("td")
                        .eq(currentIndex)
                        .find("input, select")
                        .focus();
                }
            });

            // Mark all required fields in red
            setTimeout(() => {
                $(".userFill.required").addClass("error");
            }, 200);
        },
        getPullConfiguration: function (continuous) {
            // Gather required fields based on mode
            let requiredFields = $(".phaseSection.required, .neutralSection.required");
            if ($("#powerCalculatorContainer").hasClass("v600")) {
                requiredFields = $(
                    ".phaseSection.required, .groundSection.required, .neutralSection.required"
                );
            }

            // Check if all required fields are filled
            let requiredFieldsFilled = true;
            requiredFields.each(function () {
                if ($(this).val() === "" && $(this).is(":visible")) {
                    requiredFieldsFilled = false;
                }
            });
            
            continuous = (continuous === undefined)
                ? true
                : continuous;
            const pullConfigurationPromise = $.Deferred();
            
            if (!requiredFieldsFilled) {
                pullConfigurationPromise.resolve();
                return pullConfigurationPromise.promise();
            }

            // Parse cable counts safely
            const phaseCables = parseInt($("#information-phase-cables").val()) || 0;
            const groundCables = parseInt($("#information-ground-cables").val()) || 0;
            const neutralCables = parseInt($("#information-neutral-cables").val()) || 0;
            const cablesSum = phaseCables + groundCables + neutralCables;
            $("#totalCables").text(cablesSum);

            // Gather other input values
            const _typeGround = $("#information-ground-cu_al option:selected").text();
            const _sizeGround = $("#information-ground-size option:selected").text();
            const _mode = $("#_mode").val();
            const _nonce = $("#_nonce").val();

            // Fetch OD/LBS for regular mode
            if (_mode === "regular" && _typeGround && _sizeGround && _nonce) {
                $(".loadingOverlay").addClass("active");
                $.toast({
                    heading: "Information",
                    text: "Calculating OD and LBS",
                    icon: "info",
                    hideAfter: false,
                    stack: false,
                    position: "bottom-left"
                });
                if (pullCalculator._ajaxGet_OD_LBS) 
                    pullCalculator
                        ._ajaxGet_OD_LBS
                        .abort();
                pullCalculator._ajaxGet_OD_LBS = $.ajax({
                    async: false,
                    type: "POST",
                    url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                    data: {
                        action: "get_OD_LBS",
                        type: "THHN",
                        size: _sizeGround,
                        mode: _mode,
                        nonce: _nonce
                    },
                    dataType: "json",
                    success: function (response) {
                        $(".loadingOverlay").removeClass("active");
                        if (response.status) {
                            $("#information-ground-OD").val(response.data[0].Cable_nec_od);
                            $("#information-ground-Lbsft").val(response.data[0].Cable_copper_weight);
                        }
                        $.toast(
                            {heading: "Calculating", icon: "success", hideAfter: 3000, stack: false, position: "bottom-left"}
                        );
                    }
                });
            }

            // Fetch OD/LBS for v600 mode
            if (_mode === "v600" && _nonce) {
                $(".loadingOverlay").addClass("active");
                ["phase", "ground", "neutral"].forEach(function (type) {
                    if ($("#information-" + type + "-size").val() !== "") {
                        $.toast({
                            heading: "Information",
                            text: "Calculating OD and LBS",
                            icon: "info",
                            hideAfter: false,
                            stack: false,
                            position: "bottom-left"
                        });
                        if (pullCalculator._ajaxGet_OD_LBS) 
                            pullCalculator
                                ._ajaxGet_OD_LBS
                                .abort();
                        const _type = $(
                            "#information-" + type + "-type option:selected"
                        ).text();
                        const _size = $(
                            "#information-" + type + "-size option:selected"
                        ).text();
                        if (!_type || !_size) 
                            return;
                        pullCalculator._ajaxGet_OD_LBS = $.ajax({
                            async: false,
                            type: "POST",
                            url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                            data: {
                                action: "get_OD_LBS",
                                type: _type,
                                size: _size,
                                mode: _mode,
                                nonce: _nonce
                            },
                            dataType: "json",
                            success: function (response) {
                                $(".loadingOverlay").removeClass("active");
                                if (response.status) {
                                    $("#information-" + type + "-OD").val(response.data[0].Cable_nec_od);
                                    $("#information-" + type + "-Lbsft").val(response.data[0].Cable_copper_weight);
                                }
                                $.toast(
                                    {heading: "Calculating", icon: "success", hideAfter: 3000, stack: false, position: "bottom-left"}
                                );
                            }
                        });
                    }
                });
            }

            // Determine pull configuration
            let pullConfiguration = "";
            let pullConfigurationALT = "";
            let overrideConfig = $("#override-pull-configuration").val();
            let _tmpSum = cablesSum;

            if (cablesSum > 0) {
                if (pullCalculator.debug) {}
                // Handle override
                if (overrideConfig) {
                    $("#pullConfiguration")
                        .attr("data-original", overrideConfig)
                        .text(overrideConfig);
                    switch (overrideConfig) {
                        case "Single":
                            _tmpSum = 1;
                            break;
                        case "Cradle":
                        case "Triangular":
                            _tmpSum = 3;
                            break;
                        case "Complex":
                            _tmpSum = 4;
                            break;
                    }
                    pullConfiguration = overrideConfig;
                } else {
                    // Auto-detect configuration
                    if (cablesSum === 1) {
                        pullConfiguration = "Single";
                    } else if (cablesSum === 2) {
                        pullConfiguration = "Triangular";
                    } else if (cablesSum === 3) {
                        $(".loadingOverlay").addClass("active");
                        if (pullCalculator._ajax) 
                            pullCalculator
                                ._ajax
                                .abort();
                        pullCalculator._ajax = $.ajax({
                            async: false,
                            type: "POST",
                            url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                            data: {
                                action: "inside_diameter_conduit",
                                trade_size: $("#tradeSize").val(),
                                pipetype: $("#conduitType :selected").html(),
                                raceway: $("#raceway").val(),
                                mode: _mode,
                                nonce: _nonce
                            },
                            dataType: "json",
                            success: function (response) {
                                $(".loadingOverlay").removeClass("active");
                                if (response.status) {
                                    let phase_OD = parseFloat($("#information-phase-OD").val()) || 0;
                                    let ground_OD = parseFloat($("#information-ground-OD").val()) || 0;
                                    let largest_cable_diameter = Math.max(phase_OD, ground_OD);
                                    let inside_diameter_conduit = parseFloat(response.ID) || 0;
                                    let inside_diameter_conduit_alt = parseFloat(response.ID_ALT) || 0;
                                    pullConfiguration = (inside_diameter_conduit / largest_cable_diameter < 2.5)
                                        ? "Triangular"
                                        : "Cradled";
                                    pullConfigurationALT = (
                                        inside_diameter_conduit_alt / largest_cable_diameter < 2.5
                                    )
                                        ? "Triangular"
                                        : "Cradled";
                                }
                            }
                        });
                    } else if (cablesSum > 3) {
                        pullConfiguration = "Complex";
                        pullConfigurationALT = "Complex";
                    }
                }

                // Clamp for image selection
                let imageCableSum = Math.min(_tmpSum, 4);
                $("#cableImage")
                    .attr(
                        "src",
                        pullCalculator.themeUrl + "powercable-parts/images/" + imageCableSum +
                                pullConfiguration + ".png"
                    )
                    .closest(".hide")
                    .removeClass("hide");
                $("#raceway").removeClass("redBackground");

                // Parse weights
                const phaseLbsft = parseFloat($("#information-phase-Lbsft").val()) || 0;
                const groundLbsft = parseFloat($("#information-ground-Lbsft").val()) || 0;
                const neutralLbsft = parseFloat($("#information-neutral-Lbsft").val()) || 0;
                const totalWeight = (phaseLbsft * phaseCables) + (groundLbsft * groundCables) +
                        (neutralLbsft * neutralCables);
                if (phaseCables + groundCables + neutralCables > 0) {
                    pullCalculator.totalWeight = totalWeight;
                    $("#totalWeight").text(totalWeight.toFixed(3));
                    let OD_phase = parseFloat($("#information-phase-OD").val()) || 0;
                    let OD_ground = parseFloat($("#information-ground-OD").val()) || 0;
                    pullCalculator.maxLength = Math.max(OD_phase, OD_ground);

                    // Adjust totalCables for override
                    let totalCables = phaseCables + groundCables + neutralCables;

                    if (overrideConfig) {
                        switch (pullConfiguration) {
                            case "Single":
                                totalCables = 1;
                                break;
                            case "Triangular":
                                totalCables = 2;
                                break;
                            case "Cradled":
                                totalCables = 3;
                                break;
                            case "Complex":
                                totalCables = 4;
                                break;
                        }
                    }

                    $(".loadingOverlay").addClass("active");
                    if (pullCalculator._ajaxgetWeightCorrection) 
                        pullCalculator
                            ._ajaxgetWeightCorrection
                            .abort();
                    pullCalculator.raceway = $("#raceway").val();
                    pullCalculator.tradeSize = $("#tradeSize").val();

                    //if totalCables is greater than 4 set to 4
                    if (totalCables > 4) {
                        totalCables = 4;
                    }

                    pullCalculator._ajaxgetWeightCorrection = $.ajax({
                        type: "POST",
                        url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                        data: {
                            async: pullCalculator.ajaxAsync,
                            action: "getWeightCorrection",
                            pullConfiguration: totalCables + pullConfiguration,
                            pullConfigurationALT: totalCables + (pullConfigurationALT || pullConfiguration),
                            maxLength: pullCalculator.maxLength,
                            pipetype: $("#conduitType :selected").html(),
                            raceway: $("#raceway").val(),
                            tradeSize: $("#tradeSize").val(),
                            nonce: $("#_nonce").val()
                        },
                        dataType: "json",
                        success: function (response) {
                            $(".loadingOverlay").removeClass("active");
                            if (response.status) {

                                // Clamp weightCorrection.main to 1.4 max
                                let mainCorrection = Math.min(response.weightCorrection.main, 1.4);
                                pullCalculator.weightCorrectionBase = response.weightCorrection.base;
                                pullCalculator.weightCorrection = mainCorrection;
                                pullCalculator.weightCorrectionBaseALT = response.weightCorrectionALT.base;
                                pullCalculator.weightCorrectionALT = response.weightCorrectionALT.main;
                                $("#weightCorrection")
                                    .attr("data-original", mainCorrection)
                                    .text(mainCorrection);
                            }
                            //pullCalculator.calculateSegments();
                        }
                    });
                }
            }

            // Set configuration values
            pullCalculator.pullConfiguration = pullConfiguration;
            pullCalculator.pullConfigurationALT = pullConfigurationALT || pullConfiguration;
            $("#pullConfiguration").text(pullConfiguration);

            pullCalculator.conduitTypeChange();

            setTimeout(() => {
                pullConfigurationPromise.resolve();
            }, 300);

            return $
                .when(pullConfigurationPromise)
                .done(function () {
                    if (pullCalculator.debug) {
                        console.log("pullConfigurationPromise task is done");
                    }
                })
                .promise();
        },
        racewayChange: function (continuous, element) {
            continuous = continuous === undefined
                ? true
                : continuous;
            element = element === undefined
                ? null
                : element;

            var racewayChange = $.Deferred();

            var raceway = $("#raceway").val();
            var conduitCode = "";

            if (raceway <= 2) {
                conduitCode = "PTCH";
            } else {
                conduitCode = "PTOT";
            }

            pullCalculator.raceway = $("#raceway").val();
            var comparisonMaximumLabel = pullCalculator.raceway <= 2
                ? "Maximum Support Distance (ft)"
                : "Max. Continuous Tension (lbs)";
            $("#comparison-maximum-label").text(comparisonMaximumLabel);

            $("#conduitCode").val(conduitCode);

            $(".loadingOverlay").addClass("active");
            if (pullCalculator._ajaxgetPipeTypes != null) {
                pullCalculator
                    ._ajaxgetPipeTypes
                    .abort();
            }
            pullCalculator._ajaxgetPipeTypes = $.ajax({
                async: false,
                type: "POST",
                url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                data: {
                    action: "getPipeTypes",
                    type: conduitCode,
                    nonce: $("#_nonce").val()
                },
                dataType: "json",
                success: function (response) {
                    $(".loadingOverlay").removeClass("active");
                    if (!response.status && response.msg !== undefined) {
                        //alert(response.error);
                    } else {
                        if (element == "conduitType") {
                            pullCalculator.getSizes(continuous);
                        } else {
                            $("#conduitType").empty();

                            $.each(response.data, function (i, v) {
                                $(document.createElement("option"))
                                    .attr({value: v})
                                    .html(v)
                                    .appendTo($("#conduitType"));
                            });
                        }

                        /* conduitType */
                        if (continuous) {
                            pullCalculator.getPullConfiguration();
                        }
                    }

                    setTimeout(() => {
                        racewayChange.resolve();
                    }, 300);
                }
            });

            return $
                .when(racewayChange)
                .done(function () {
                    if (pullCalculator.debug) {
                        console.log("racewayChange task is done");
                    }
                })
                .promise();
        },
        getSizes: function (continuous) {
            continuous = continuous === undefined
                ? true
                : false;

            var tradeSize = $.Deferred();

            $("#tradeSize").empty();
            var raceway = $("#raceway").val();
            $(".loadingOverlay").addClass("active");

            if (pullCalculator._ajaxgetSizes != null) {
                pullCalculator
                    ._ajaxgetSizes
                    .abort();
            }

            pullCalculator._ajaxgetSizes = $.ajax({
                type: "POST",
                async: pullCalculator.ajaxAsync,
                url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                data: {
                    action: "getSizes",
                    raceway: raceway,
                    conduitType: $("#conduitType").val(),
                    nonce: $("#_nonce").val()
                },
                dataType: "json",
                success: function (response) {
                    $(".loadingOverlay").removeClass("active");
                    if (response.status) {
                        $("#tradeSize").empty();

                        $.each(response.data, function (i, v) {
                            $(document.createElement("option"))
                                .attr({
                                    value: v.replace(/"/g, "")
                                })
                                .html(v)
                                .appendTo($("#tradeSize"));
                        });

                        pullCalculator.tradeSize = response
                            .data[0]
                            .replace(/"/g, "");
                        /* on change */
                        if (continuous) {
                            $("#cablesForm .required")
                                // .off()
                                // .on("change", function () { alert('hhh');
                                //     if ($("#raceway").val() != "" && $("#tradeSize").val() != "" && $("#conduitType").val() != "") {
                                //         pullCalculator.getSizes();
                                //     }
                                // });

                            pullCalculator
                                .getPullConfiguration()
                                .done(function () {
                                    pullCalculator
                                        .conduitTypeChange()
                                        .done(function () {
                                            if ($(".segments-item .seg_1 [name='segment-build-list-slope-direction']").val() != "") {
                                                //pullCalculator.calculateSegments();
                                            }
                                        });
                                });
                        }
                    }

                    setTimeout(() => {
                        tradeSize.resolve();
                    }, 300);
                }
            });

            return $
                .when(tradeSize)
                .done(function () {
                    if (pullCalculator.debug) {
                        console.log("tradeSize task is done");
                    }
                })
                .promise();
        },
        cableInputSizeChange: function () {
            $("#information-size").empty();
            $(".loadingOverlay").addClass("active");
            if (pullCalculator._ajaxgetCableInputSizes != null) {
                pullCalculator
                    ._ajaxgetCableInputSizes
                    .abort();
            }
            pullCalculator._ajaxgetCableInputSizes = $.ajax({
                type: "POST",
                async: pullCalculator.ajaxAsync,
                url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                data: {
                    action: "getCableInputSizes",
                    mode: $("#_mode").val(),
                    "information-type": $("#information-type option:selected").html(),
                    nonce: $("#_nonce").val()
                },
                dataType: "json",
                success: function (response) {
                    $(".loadingOverlay").removeClass("active");
                    if (response.status && response.msg !== undefined) {
                        $("#information-size").empty();

                        $.each(response.data, function (i, v) {
                            $(document.createElement("option"))
                                .attr({value: v})
                                .html(v)
                                .appendTo($("#information-size"));
                        });
                    }
                }
            });
        },
        conduitTypeChange: function () {
            var conduitTypeChange = $.Deferred();
            var OD_phase = $("#information-phase-OD").val();
            var Cables = parseInt($("#information-phase-cables").val());
            var OD_ground = parseInt($("#information-ground-OD").val());
            //if Cables is NaN, set to 0
            if (isNaN(OD_ground)) {
                OD_ground = 0;
            }
            var Cables_ground = parseInt($("#information-ground-cables").val());
            //if Cables is NaN, set to 0
            if (isNaN(Cables_ground)) {
                Cables_ground = 0;
            }

            var OD_neutral = parseInt($("#information-neutral-OD").val());
            //if Cables is NaN, set to 0
            if (isNaN(OD_neutral)) {
                OD_neutral = 0;
            }
            var Cables_neutral = parseInt($("#information-neutral-cables").val());
            //if Cables is NaN, set to 0
            if (isNaN(Cables_neutral)) {
                Cables_neutral = 0;
            }
            pullCalculator.type = $("#conduitType option:selected").html();
            pullCalculator.tradeSize = $("#tradeSize").val();
            pullCalculator.raceway = $("#raceway").val();

            // Cable Area ((0.25*PI()*'Power Cable Pull'!$T$7^2)*'Power Cable Pull'!$L$7)
            // ((0.25*PI()*'Power Cable Pull'!$T$8^2)*'Power Cable Pull'!$L$8)
            // ((0.25*PI()*'Power Cable Pull'!$T$9^2)*'Power Cable Pull'!$L$9)
            pullCalculator.totalCableArea = 0.25 * Math.PI * Math.pow(OD_phase, 2) * Cables + 0.25 * Math.PI * Math.pow(
                OD_neutral,
                2
            ) * Cables_neutral + 0.25 * Math.PI * Math.pow(OD_ground, 2) * Cables_ground;

            $(".loadingOverlay").addClass("active");

            if (pullCalculator.type != "" && pullCalculator.type != "Select an Option") {
                pullCalculator._ajaxmin_nec_fill = $.ajax({
                    async: pullCalculator.ajaxAsync,
                    type: "POST",
                    url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                    data: {
                        action: "min_nec_fill",
                        trade_size: pullCalculator.tradeSize,
                        pipetype: pullCalculator.type,
                        raceway: pullCalculator.raceway,
                        mode: $("#_mode").val(),
                        total_cable: pullCalculator.totalCableArea,
                        cables: Cables + Cables_ground,
                        nonce: $("#_nonce").val()
                    },
                    dataType: "json",
                    success: function (response) {
                        $(".loadingOverlay").removeClass("active");
                        pullCalculator.minimumTrade = response.index;
                        $("#minimumTrade").show();
                        $("#minimumTrade").html(
                            "NEC Minimum Trade Size - " + response.index + "'' " + pullCalculator.type
                        );

                        setTimeout(() => {
                            conduitTypeChange.resolve();
                        }, 300);
                    }
                });
            }

            return $
                .when(conduitTypeChange)
                .done(function () {
                    if (pullCalculator.debug) {
                        console.log("conduitTypeChange task is done");
                    }
                })
                .promise();
        },
        addSegment: function (items) {
            var addSegment = $.Deferred();

            $.get(
                pullCalculator.themeUrl + "powercable-parts/segment-build-original-item-tables." +
                        "html",
                function (html_string) {
                    var _html = html_string;
                    $.get(
                        pullCalculator.themeUrl + "powercable-parts/segments-build-body.html",
                        function (body_html) {
                            var body = "";
                            if ($("[name='segment-build-list-slope-direction']").length < 12) {
                                for (let index = 0; index < items; index++) {
                                    var cloned = body_html.replace(/\{seg_number\}/g, pullCalculator.segment);
                                    body += cloned;
                                    pullCalculator.segment++;
                                }

                                _html = $(_html.replace(/\{body_content\}/g, body));
                                $(_html).appendTo("#segmentBuildList");

                                $(".remove")
                                    .off()
                                    .on("click", function (e) {
                                        pullCalculator.removeSection(e.target);
                                    });

                                pullCalculator.checkFields();

                                setTimeout(() => {
                                    addSegment.resolve();
                                }, 300);
                            }
                        },
                        "html"
                    );
                },
                "html"
            );

            return $
                .when(addSegment)
                .done(function () {
                    if (pullCalculator.debug) {
                        console.log("addSegment task is done");
                    }
                })
                .promise();
        },
        getSegments: function (reverse, type, save) {

            var type = (type === undefined)
                ? "regular"
                : type;

            var save = (save === undefined)
                ? false
                : save;

            //if reverse is undefined set to true
            reverse = (reverse === undefined)
                ? true
                : reverse;

            if (pullCalculator.debug) {
                console.log("getSegments");
            }

            var unindexed_array = jQuery(
                "#powerCalculatorContainer .segments-item .form-control"
            ).serializeArray();
            var indexed_array = [];
            var index = 0;

            jQuery.map(unindexed_array, function (n, i) {
                if (indexed_array[index] === undefined) {
                    indexed_array[index] = {};
                }
                //They positon exist then is a new segment
                if (indexed_array[index][n["name"]] !== undefined) {
                    index++;
                    if (indexed_array[index] === undefined) {
                        indexed_array[index] = {};
                    }
                }
                indexed_array[index][n["name"]] = n["value"];
            });

            // Remove entries if segment-build-list-length or segment-build-list-slope-direction are empty
            indexed_array = indexed_array.filter(function (segment) {
                return segment["segment-build-list-length"] !== "" && segment["segment-build-list-slope-direction"] !== "";
            });

            //reverse the array
            if (!save) {
                indexed_array = Array.isArray(indexed_array)
                ? indexed_array.reverse()
                : indexed_array;
            }

            if (!jQuery("#changeSegmentsDirection").hasClass("reverse")) {
                pullCalculator.regularSegments = indexed_array;

                pullCalculator.changeSegmentsOrder(reverse);
            }

            return indexed_array;
        },
        changeSegmentsOrder: function (_toggleReverse) {

            var _toggleReverse = (_toggleReverse === undefined)
                ? true
                : _toggleReverse;

            if (pullCalculator.debug) {
                console.log("changeSegmentsDirection");
            }

            if (_toggleReverse) {
                $("#changeSegmentsDirection").toggleClass("regular reverse");
            }

            var reversed = $("#changeSegmentsDirection").hasClass("reverse");

            const text = reversed
                ? "Reversed"
                : "Original";
            $("#changeSegmentsDirectionLabel").text(text);

            // Deep clone to avoid mutating the original array
            var reversedSegments = (pullCalculator.regularSegments).map(seg => Object.assign({}, seg));
            var valuesCopied = false;
            //iterate and check if first angle or radius are empty, if so copy from next element and remove last element values
            $.each(reversedSegments, function (i, v) {
                if (
                    ((reversedSegments[0] && (reversedSegments[0]["segment-build-list-elbow-angle"] === "" || reversedSegments[0]["segment-build-list-elbow-radius"] === "")) || valuesCopied === true)
                    && reversedSegments[i + 1]
                ) {
                    v["segment-build-list-elbow-angle"] = reversedSegments[i + 1]["segment-build-list-elbow-angle"];
                    v["segment-build-list-elbow-radius"] = reversedSegments[i + 1]["segment-build-list-elbow-radius"];
                    valuesCopied = true;
                }

                //flip Up/Down directions
                var dir = v["segment-build-list-slope-direction"];
                //remove spaces
                dir = dir.trim();
                if (dir == "Up") {
                    dir = "Down";
                } else if (dir == "Down") {
                    dir = "Up";
                }

                reversedSegments[i]["segment-build-list-slope-direction"] = dir;
            });

            if (valuesCopied) {
                // Set last element values to empty
                var lastIndex = reversedSegments.length - 1;
                reversedSegments[lastIndex]["segment-build-list-elbow-angle"] = "";
                reversedSegments[lastIndex]["segment-build-list-elbow-radius"] = "";
            }

            /*//get regular segments and revers them then store it
            var reversedSegments = (pullCalculator.regularSegments).map(
                seg => Object.assign({}, seg)
            );

            //iterate and Flip Up/Down directions
            $.each(reversedSegments, function (i, v) {
                var dir = v["segment-build-list-slope-direction"];
                //remove spaces
                dir = dir.trim();

                if (dir == "Up") {
                    dir = "Down";
                } else if (dir == "Down") {
                    dir = "Up";
                }

                reversedSegments[i]["segment-build-list-slope-direction"] = dir;
            });

            // If any if the values on the last position of reversed array arent emtpy, add
            // a new segment with values in 0
             if (reversedSegments.length) {
                // Deep clone to avoid mutating the original array reversedSegments =
                // reversedSegments.map(seg => Object.assign({}, seg));

                var lastSegment = reversedSegments[reversedSegments.length - 1];
                if (lastSegment["segment-build-list-slope-direction"] !== "" || lastSegment["segment-build-list-length"] !== "" || lastSegment["segment-build-list-elbow-angle"] !== "" || lastSegment["segment-build-list-elbow-radius"] !== "" && (reversedSegments[0]["segment-build-list-slope-direction"] !== 0 && reversedSegments[0]["segment-build-list-length"] !== "")) {
                    // Add to the beginning
                    reversedSegments.unshift(
                        {"segment-build-list-slope-direction": "", "segment-build-list-length": 0, "segment-build-list-elbow-angle": "", "segment-build-list-elbow-radius": ""}
                    );
                }

                // Iterate the reversedSegments and copy the angle and radius of the next
                // element
                for (var i = 0; i < reversedSegments.length; i++) {
                    if (reversedSegments[i + 1] !== undefined) {
                        reversedSegments[i]["segment-build-list-elbow-angle"] = reversedSegments[i + 1]["segment-build-list-elbow-angle"];
                        reversedSegments[i]["segment-build-list-elbow-radius"] = reversedSegments[i + 1]["segment-build-list-elbow-radius"];
                    }
                }

                // Clean the last segment
                reversedSegments[reversedSegments.length - 1]["segment-build-list-elbow-angle"] = "";
                reversedSegments[reversedSegments.length - 1]["segment-build-list-elbow-radius"] = "";
            } */

            pullCalculator.reverseSegments = reversedSegments;
        },
        displaySegments: function () {
            // Primero limpiar los campos y clases
            $("#segmentBuildList").trigger("reset");
            $("#segmentBuildList td label")
                .removeClass("redText purpleBackground")
                .text("");
            $("#segmentBuildList td input")
                .removeClass("redText purpleBackground")
                .val("");

            // Ahora rellenar los valores de los segmentos
            var reverse = $("#changeSegmentsDirection").hasClass("reverse");
            var segments = [];

            if (reverse) {
                segments = (pullCalculator.reverseSegments).map(seg => Object.assign({}, seg));
                // Escribir segmentos en la UI (de atrás hacia adelante)
                for (var i = segments.length - 1; i >= 0; i--) {
                    var segment = segments[i];
                    var uiIndex = i + 1;
                    $(
                        "#segmentBuildList .seg_" + uiIndex + " [name='segment-build-list-note']"
                    )
                        .val(segment["segment-build-list-note"] || "")
                        .trigger("change");
                    $(
                        "#segmentBuildList .seg_" + uiIndex + " [name='segment-build-list-slope']"
                    )
                        .val(segment["segment-build-list-slope"] || "")
                        .trigger("change");
                    $(
                        "#segmentBuildList .seg_" + uiIndex + " [name='segment-build-list-slope-directi" +
                        "on']"
                    )
                        .val(segment["segment-build-list-slope-direction"] || "")
                        .trigger("change");
                    $(
                        "#segmentBuildList .seg_" + uiIndex + " [name='segment-build-list-length']"
                    )
                        .val(segment["segment-build-list-length"] || 0)
                        .trigger("change");
                    $(
                        "#segmentBuildList .seg_" + uiIndex +
                        " [name='segment-build-list-elbow-angle']"
                    )
                        .val(segment["segment-build-list-elbow-angle"] || "")
                        .trigger("change");
                    $(
                        "#segmentBuildList .seg_" + uiIndex +
                        " [name='segment-build-list-elbow-radius']"
                    )
                        .val(segment["segment-build-list-elbow-radius"] || "")
                        .trigger("change");
                }
            } else {
                segments = (pullCalculator.regularSegments)
                    .map(seg => Object.assign({}, seg))
                    .reverse();
                // Escribir segmentos en la UI (orden normal)
                for (var i = 0; i < segments.length; i++) {
                    var segment = segments[i];
                    var uiIndex = i + 1;
                    $(
                        "#segmentBuildList .seg_" + uiIndex + " [name='segment-build-list-note']"
                    )
                        .val(segment["segment-build-list-note"] || "")
                        .trigger("change");
                    $(
                        "#segmentBuildList .seg_" + uiIndex + " [name='segment-build-list-slope']"
                    )
                        .val(segment["segment-build-list-slope"] || "")
                        .trigger("change");
                    $(
                        "#segmentBuildList .seg_" + uiIndex + " [name='segment-build-list-slope-directi" +
                        "on']"
                    )
                        .val(segment["segment-build-list-slope-direction"] || "")
                        .trigger("change");
                    $(
                        "#segmentBuildList .seg_" + uiIndex + " [name='segment-build-list-length']"
                    )
                        .val(segment["segment-build-list-length"] || 0)
                        .trigger("change");
                    $(
                        "#segmentBuildList .seg_" + uiIndex +
                        " [name='segment-build-list-elbow-angle']"
                    )
                        .val(segment["segment-build-list-elbow-angle"] || "")
                        .trigger("change");
                    $(
                        "#segmentBuildList .seg_" + uiIndex +
                        " [name='segment-build-list-elbow-radius']"
                    )
                        .val(segment["segment-build-list-elbow-radius"] || "")
                        .trigger("change");
                }
            }

            pullCalculator.calculateSegments();
        },
        calculateSegments: function (_force) {

            //failsafe _force
            var _force = _force || false;

            //if pullCalculator.regularSegments is empty call getsegments
            if (pullCalculator.regularSegments === null) {
                pullCalculator.getSegments(false);
            }

            //cancel segmentChangeTimeout
            clearTimeout(pullCalculator.segmentChangeTimeout);

            var calculateSegments = $.Deferred();

            // Exit early if calculations are cancelled
            if (pullCalculator.cancelCalculations) {
                pullCalculator.cancelCalculations = false;
                calculateSegments.resolve();
                return calculateSegments.promise();
            }

            // Ensure weightCorrection is set before proceeding
            if (pullCalculator.weightCorrection == null) {
                pullCalculator.getPullConfiguration();
            }

            // Enable all non-userFill inputs/selects for editing
            $(
                "#powerCalculatorContainer input:not(.userFill), #powerCalculatorContainer sele" +
                "ct:not(.userFill)"
            ).removeAttr("disabled");

            // Gather segment data var segments = pullCalculator.getSegments(false);
            var segments;
            if ($("#changeSegmentsDirection").hasClass("reverse")) {
                segments = pullCalculator.reverseSegments;
            } else {
                segments = pullCalculator.regularSegments;
            }

            if (segments === undefined || segments === null || segments.length === 0) {
                segments = pullCalculator.getSegments(false);
            }

            var jacket = $("#information-phase-jacket").val();
            var indexArray = {
                "Horizontal": 1,
                "Up": 2,
                "Down": 3
            };
            var indexDirection = "";
            pullCalculator.directions = [];
            pullCalculator.totallengthOfBend = 0;

            // Remove previous highlights
            $(".segments-item td").removeClass("greenBackground");

            // Validate and build directions/indexDirection Iterate segments backwards
            for (let i = segments.length - 1; i >= 0; i--) {
                var v = segments[i];
                var dir = v["segment-build-list-slope-direction"];
                var slope = v["segment-build-list-slope"];
                var length = v["segment-build-list-length"];

                if (length !== "") {
                    var dir1 = indexArray[dir] || 1;
                    var dir2 = 0;
                    if (segments[i - 1] && segments[i - 1]["segment-build-list-slope-direction"] !== "") {
                        dir2 = indexArray[segments[i - 1]["segment-build-list-slope-direction"]] || 0;
                    }
                    indexDirection += dir1 + "" + dir2 + "&";
                    pullCalculator.directions[segments.length - 1 - i] = (
                        typeof dir === "string"
                            ? dir
                            : ""
                    ).slice(0, 1);

                    // Highlight missing slope for Up/Down
                    if ((dir === "Down" || dir === "Up") && slope === "") {
                        $(".segments-item .seg_" + (
                            i + 1
                        ) + " [name='segment-build-list-slope']")
                            .parent()
                            .addClass("greenBackground");
                    }
                    // Highlight missing length
                    if (length === "") {
                        $(".segments-item .seg_" + (
                            i + 1
                        ) + " [name='segment-build-list-length']")
                            .parent()
                            .addClass("greenBackground");
                    }
                }
            }

            /* // Special case: allow reverse mode to bypass some validation
            if ($("#changeSegmentsDirection").hasClass("reverse")) {
                isValid = true;
            } */

            pullCalculator.segment--;

            // Remove trailing '&'
            if (indexDirection.endsWith("&")) {
                indexDirection = indexDirection.slice(0, -1);
            }

            // Get maxLength for calculation (use largest OD)
            var OD_phase = parseFloat($("#information-phase-OD").val()) || 0;
            var OD_ground = parseFloat($("#information-ground-OD").val()) || 0;
            var maxLength = Math.max(OD_phase, OD_ground);

            // Abort any previous segment calculation AJAX
            if (pullCalculator._ajaxSegments) {
                pullCalculator
                    ._ajaxSegments
                    .abort();
            }

            // If only one segment, check for required fields
            if (indexDirection.indexOf("&") === -1) {
                isValid = false;
                if ($(".segments-item .seg_1 [name='segment-build-list-slope-direction']").val() !== "" && $("#segment-build-list-elbow-angle_1").val() != 0 && $("#segment-build-list-elbow-radius_1").val() != 0 && $("#segment-build-list-length_1").val() !== "") {
                    isValid = true;
                }
                $(".loadingOverlay").removeClass("active");
            }

            // Show loading overlay and start calculation
            $(".loadingOverlay").addClass("active");
            pullCalculator._ajaxSegments = $.ajax({
                type: "POST",
                async: pullCalculator.ajaxAsync,
                url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                data: {
                    async: pullCalculator.ajaxAsync,
                    action: "calculateSegments",
                    segments: indexDirection,
                    raceway: pullCalculator.raceway,
                    jacket: jacket,
                    coefficient_column: pullCalculator.coefficient_of_friction_column,
                    cableSum: pullCalculator.cablesSum,
                    pullConfiguration: pullCalculator.pullConfiguration,
                    maxLength: maxLength,
                    pipetype: pullCalculator.type,
                    calcType: $("#_mode").val(),
                    nonce: $("#_nonce").val()
                },
                dataType: "json",
                success: function (response) {
                    $(".loadingOverlay").removeClass("active");
                    if (response.status) {

                        var reversed = $("#changeSegmentsDirection").hasClass("reverse");

                        // Update segment types and directions in UI Update segment types and directions
                        // in UI, handling both reversed and normal order
                        const segments = reversed
                            ? response
                                .segments
                                .slice()
                                .reverse()
                            : response.segments;
                        $.each(segments, function (i, s) {
                            const segIndex = i + 1;
                            const $seg = $(".segments-item .seg_" + segIndex);

                            // Update type select and label
                            $seg
                                .find("select.segment-build-list-type")
                                .val(s.type)
                                .trigger("change");
                            $seg
                                .find("label.segment-build-list-type")
                                .text($seg.find("select.segment-build-list-type option:selected").text());

                            // Update direction input
                            $seg
                                .find("[name='segment-build-list-direction']")
                                .val(s.direction);
                        });

                        // Store results and update summary
                        pullCalculator.sumTension = 0;
                        pullCalculator.sumTension_v600 = 0;
                        pullCalculator.calculatedSegments = response;
                        pullCalculator.coefficientFriction = response.coefficient;
                        pullCalculator.coefficientFriction_v600 = response.coefficient_alt;

                        var _direction = pullCalculator.calculateComparison(
                            response,
                            pullCalculator.directions
                        );

                        pullCalculator.maxSWBP = _direction["finalSWBP"];
                        pullCalculator.totalLength = _direction["finalLength"];
                        pullCalculator.totallengthOfBend = _direction["FinaltotallengthOfBend"];

                        $.toast(
                            {heading: "Calculating", showHideTransition: "slide", icon: "success", stack: false, position: "bottom-left"}
                        );
                    }

                    setTimeout(() => {
                        calculateSegments.resolve();
                    }, 300);

                    pullCalculator
                        .summary()
                        .done(function () {
                            pullCalculator.comparison();
                        });
                }
            });

            return calculateSegments
                .promise()
                .done(function () {
                    if (pullCalculator.loadDataId != null) {
                        $.toast({
                            heading: "Calculating",
                            text: "Data loaded",
                            showHideTransition: "slide",
                            icon: "success",
                            stack: true,
                            hideAfter: 3000,
                            position: "bottom-left"
                        });
                    }

                    if (pullCalculator.debug) {
                        console.log("calculateSegments task is done");
                    }
                });
        },
        calculateComparison: function (response, directions) {
            var dollarUSLocale = Intl.NumberFormat("en-US");
            var SS_PT = 0;
            var SS_PT_v600 = 0;
            var outgoingTension = 0;
            var outgoingTensionALT = 0;
            var outgoingTension_v600 = 0;
            var outgoingTensionNoFixed = 0;
            var outgoingTensionNoFixed_v600 = 0;
            var finalLength = 0;
            var FinaltotallengthOfBend = 0;
            var finalSWBP = 0;
            var incomingTension = parseFloat($("#incoming-tension").val());
            var incomingTension_v600 = incomingTension;
            var incomingTensionALT = incomingTension;
            pullCalculator.sumTensionALT = 0;
            //console.clear();

            if ($("#changeSegmentsDirection").hasClass("reverse")) {
                directions = directions.reverse();
            }

            $.each(directions, function (i, v) {
                //if (v !== undefined) {
                var _i = i + 1;

                // Handle begin segment and incoming tension
                if (_i > 1) {
                    var begin_segment = parseFloat($(
                        ".segments-item .seg_" + _i + " [name='segment-build-list-begin-segment']"
                    ).val());
                    if (isNaN(begin_segment)) {
                        incomingTension = parseFloat(outgoingTensionNoFixed);
                        if (pullCalculator.raceway > 2) {
                            incomingTension_v600 = parseFloat(outgoingTensionNoFixed_v600);
                        }
                    } else {
                        incomingTension = begin_segment;
                        if (pullCalculator.raceway > 2) {
                            incomingTension_v600 = parseFloat(begin_segment);
                        }
                    }
                }
                if ($(
                    ".segments-item .seg_" + _i + " [name='segment-build-list-begin-segment']"
                ).length > 0 && $(
                    ".segments-item .seg_" + _i + " [name='segment-build-list-begin-segment']"
                ).val() == "Yes") {
                    if (pullCalculator.debug) {
                        console.log("🚀 ~ incomingTension:", incomingTension);
                    }
                    incomingTension = parseFloat($("#incoming-tension").val());
                }

                // Get segment values
                var _length = parseFloat($(
                    ".segments-item .seg_" + _i + " [name='segment-build-list-length']"
                ).val()) || 0;
                var _slope_deg = parseFloat($(
                    ".segments-item .seg_" + _i + " [name='segment-build-list-slope']"
                ).val()) || 0;
                var _override = parseFloat($("#override-coefficient-friction").val()) || 0;

                // Calculate coefficients
                var basic_coef_of_fr = _override > 0
                    ? _override
                    : response.coefficient;
                var basic_coef_of_fr_v600 = _override > 0
                    ? _override
                    : response.coefficient_v600;
                var basic_coef_of_fr_alt = (_override > 0)
                    ? _override
                    : response.coefficient_alt;

                if (parseFloat($("#totalCables").val()) == 3 && _override > 0 && _override <= basic_coef_of_fr) {
                    basic_coef_of_fr_alt = _override;
                }

                if (pullCalculator.debug) {
                    console.log(
                        "%c basic_coef_of_fr -> " + basic_coef_of_fr,
                        "color: #ff0000; font-size: 14px;"
                    );
                    console.log(
                        "%c basic_coef_of_fr_alt -> " + basic_coef_of_fr_alt,
                        "color: #ff0000; font-size: 14px;"
                    );
                }

                pullCalculator.coefficient_of_friction = basic_coef_of_fr;

                pullCalculator.coefficient_of_friction_v600 = basic_coef_of_fr_alt;

                // Calculate ECoF values
                function safeMul(a, b) {
                    a = parseFloat(a);
                    b = parseFloat(b);
                    return (isNaN(a) || isNaN(b))
                        ? 0
                        : a * b;
                }
                pullCalculator.ECoF = safeMul(
                    basic_coef_of_fr,
                    pullCalculator.weightCorrection
                ).toFixed(2);
                pullCalculator.ECoF_v600 = safeMul(
                    basic_coef_of_fr_v600,
                    pullCalculator.weightCorrection
                ).toFixed(2);
                pullCalculator.ECoF_ALT = safeMul(
                    basic_coef_of_fr_alt,
                    pullCalculator.weightCorrectionALT
                ).toFixed(2);

                // Calculate pull_BCoF values
                var pull_BCoF = safeMul(basic_coef_of_fr, pullCalculator.weightCorrection).toFixed(
                    2
                );
                var pull_BCoF_v600 = safeMul(
                    response.coefficient_v600,
                    pullCalculator.weightCorrection
                ).toFixed(2);
                var pull_BCoF_alt = safeMul(
                    response.coefficient_alt,
                    pullCalculator.weightCorrectionALT
                ).toFixed(2);

                // Calculate SS_PT (Static Sag Tension)
                // Fixed: Use consistent ECoF throughout all calculations
                if (pullCalculator.debug) {
                    console.log("🚀 ~ v:", v);
                }

                if (v == "U") {
                    SS_PT = incomingTension + _length * pullCalculator.totalWeight * (
                        Math.sin((_slope_deg * Math.PI) / 180) + pullCalculator.ECoF * Math.cos((_slope_deg * Math.PI) / 180)
                    );
                    if (pullCalculator.raceway > 2) {
                        SS_PT_v600 = incomingTension_v600 + _length * pullCalculator.totalWeight * (
                            Math.sin((_slope_deg * Math.PI) / 180) + pullCalculator.ECoF_v600 * Math.cos((_slope_deg * Math.PI) / 180)
                        );
                    }
                    SS_PT_Alt = incomingTensionALT + _length * pullCalculator.totalWeight * (
                        Math.sin((_slope_deg * Math.PI) / 180) + pullCalculator.ECoF_ALT * Math.cos((_slope_deg * Math.PI) / 180)
                    );
                } else if (v == "D") {

                    SS_PT = incomingTension - _length * pullCalculator.totalWeight * (
                        Math.sin((_slope_deg * Math.PI) / 180) - pullCalculator.ECoF * Math.cos((_slope_deg * Math.PI) / 180)
                    );

                    if (SS_PT < 0){
                        SS_PT = 1;
                    }

                    if (pullCalculator.raceway > 2) {
                        SS_PT_v600 = incomingTension_v600 - _length * pullCalculator.totalWeight * (
                            Math.sin((_slope_deg * Math.PI) / 180) - pullCalculator.ECoF_v600 * Math.cos((_slope_deg * Math.PI) / 180)
                        );
                    }

                    SS_PT_Alt = incomingTensionALT - _length * pullCalculator.totalWeight * (
                        Math.sin((_slope_deg * Math.PI) / 180) - pullCalculator.ECoF_ALT * Math.cos((_slope_deg * Math.PI) / 180)
                    );

                    if (SS_PT_Alt < 0){
                        SS_PT_Alt = 1;
                    }

                } else {
                    SS_PT = incomingTension + _length * pullCalculator.totalWeight * pullCalculator.ECoF;
                    if (pullCalculator.raceway > 2) {
                        SS_PT_v600 = incomingTension_v600 + _length * pullCalculator.totalWeight * pullCalculator.ECoF_v600;
                    }
                    SS_PT_Alt = incomingTensionALT + _length * pullCalculator.totalWeight * pullCalculator.ECoF_ALT;
                }


                // Round SS_PT_Alt to nearest 10th
                SS_PT_Alt = Math.round(SS_PT_Alt * 10) / 10;

                // Calculate outgoing tension
                var elbow_angle = parseFloat($(
                    ".segments-item .seg_" + _i + " [name='segment-build-list-elbow-angle']"
                ).val()) || 0;

                // Fixed: Use consistent ECoF and keep values as numbers
                var expValue = pullCalculator.ECoF * ((elbow_angle * Math.PI) / 180);
                var powValue = Math.pow(2.718, expValue);
                var result = SS_PT * powValue;
                if (isNaN(result)) {
                    outgoingTensionNoFixed = outgoingTension = 0;
                } else {
                    // Keep as number, don't convert to string
                    outgoingTensionNoFixed = outgoingTension = result;
                }

                if (pullCalculator.raceway > 2) {
                    outgoingTensionNoFixed_v600 = outgoingTension_v600 =
                        SS_PT_v600 * Math.pow(2.718, (pullCalculator.ECoF_v600 * (elbow_angle * Math.PI)) / 180);
                }

                outgoingTensionALT = SS_PT_Alt * Math.pow(
                    2.718,
                    pullCalculator.ECoF_ALT * ((elbow_angle * Math.PI) / 180)
                );

                incomingTensionALT = parseFloat(outgoingTensionALT);

                outgoingTensionALT = Math.round(outgoingTensionALT);
                if (outgoingTensionALT > parseFloat(pullCalculator.sumTensionALT)) {
                    pullCalculator.sumTensionALT = outgoingTensionALT;
                }

                // Calculate SWBP - Fixed: Keep radius as number and protect against division by zero
                var elbow_radius = parseFloat($(
                    ".segments-item .seg_" + _i + " [name='segment-build-list-elbow-radius']"
                ).val()) || 0;
                var SWBP = 0;

                // Only calculate SWBP if radius > 0 to avoid division by zero
                if (elbow_radius > 0) {
                    var Ri_ft = elbow_radius / 12; // Keep as number

                    if (pullCalculator.pullConfiguration == "Single") {
                        SWBP = outgoingTension / Ri_ft;
                    } else if (pullCalculator.pullConfiguration == "Triangular") {
                        SWBP = (pullCalculator.weightCorrection * outgoingTension) / (2 * Ri_ft);
                    } else if (pullCalculator.pullConfiguration == "Cradled") {
                        SWBP = ((3 * pullCalculator.weightCorrection - 2) * outgoingTension) / (3 * Ri_ft);
                    } else if (pullCalculator.pullConfiguration == "Complex") {
                        // Explicit handling for Complex configuration
                        SWBP = (pullCalculator.weightCorrection * outgoingTension) / (2 * Ri_ft);
                    } else {
                        // Fallback for any other configuration
                        SWBP = (pullCalculator.weightCorrection * outgoingTension) / (2 * Ri_ft);
                    }
                }

                if (SWBP < 0)
                    SWBP = 0;
                
                // If user override tension, use that value
                if ($(
                    ".segments-item .seg_" + _i + " [name='segment-build-list-tension']"
                ).hasClass("override")) {
                    outgoingTension = $(
                        ".segments-item .seg_" + _i + " [name='segment-build-list-tension']"
                    ).val();
                }

                SWBP = pullCalculator.roundOrTruncate(SWBP);

                // Set outgoing tension in UI
                if (SWBP != Infinity) {
                    outgoingTension = Math.round(outgoingTension);
                    if (!isNaN(outgoingTension) && outgoingTension > 0) {
                        if (outgoingTension > pullCalculator.sumTension) {
                            pullCalculator.sumTension = outgoingTension;
                        }
                        outgoingTension = parseFloat(outgoingTension);
                        if (isNaN(outgoingTension)) 
                            outgoingTension = "";
                        outgoingTension = outgoingTension
                            .toString()
                            .replace(".", ",");
                        $(
                            ".segments-item .seg_" + _i + " .segment-build-list-tension"
                        ).val(outgoingTension);
                    }
                }

                if (outgoingTension_v600 > pullCalculator.sumTension_v600) {
                    outgoingTension_v600 = Math.round(outgoingTension_v600);
                    pullCalculator.sumTension_v600 = outgoingTension_v600;
                }

                // Set values in UI
                finalLength += _length;
                var totallengthOfBend = parseFloat(
                    ((elbow_angle / 360) * 2 * Math.PI * elbow_radius).toFixed(5)
                );
                FinaltotallengthOfBend += totallengthOfBend;

                // $(".segments-item .seg_" + _i + "
                // .segment-build-list-tension").val(outgoingTension);

                outgoingTension = pullCalculator.roundOrTruncate(outgoingTension);

                var _tmpdollarUSLocale = "";
                if (isNaN(outgoingTension) || outgoingTension === "" || outgoingTension === null) {
                    _tmpdollarUSLocale = "";
                } else {
                    _tmpdollarUSLocale = dollarUSLocale.format(outgoingTension);
                }

                $(
                    ".segments-item .seg_" + _i + " label.segment-build-list-tension"
                ).text(_tmpdollarUSLocale);

                if (outgoingTension > pullCalculator.sumTension) {
                    outgoingTension = Math.round(outgoingTension);
                    pullCalculator.sumTension = outgoingTension;
                }

                if (isFinite(SWBP)) {
                    $(
                        ".segments-item .seg_" + _i + " .segment-build-list-SWBP"
                    ).val(SWBP);
                    $(
                        ".segments-item .seg_" + _i + " label.segment-build-list-SWBP"
                    ).html(dollarUSLocale.format(SWBP).replace(".", ","));
                }

                if (SWBP > finalSWBP) {
                    finalSWBP = SWBP;
                }
                //}
            });

            pullCalculator.calculateComparisonALT(response, directions);

            return {finalSWBP: finalSWBP, finalLength: finalLength, FinaltotallengthOfBend: FinaltotallengthOfBend};
        },
        calculateComparisonALT: function (response, directions) {
            var dollarUSLocale = Intl.NumberFormat("en-US");
            var SS_PT = 0;
            var SS_PT_v600 = 0;
            var outgoingTension = 0;
            var outgoingTension_v600 = 0;
            var outgoingTensionNoFixed = 0;
            var outgoingTensionNoFixed_v600 = 0;
            var finalLength = 0;
            var FinaltotallengthOfBend = 0;
            var finalSWBP = 0;
            var inputTension = 0;
            var incomingTension = parseFloat($("#incoming-tension").val());
            var incomingTension_v600 = incomingTension;
            var reversed = $("#changeSegmentsDirection").hasClass("reverse");
            pullCalculator.maxReverseTensions = 0;

            //get direction from reversed segments
            var directions = [];
            if (!reversed) {
                pullCalculator.getSegments(false);
                pullCalculator.changeSegmentsOrder(false);

                //iterate reversedSegments to get directions
                $.each(pullCalculator.reverseSegments, function (i, seg) {
                    directions.push(seg["segment-build-list-slope-direction"].charAt(0));
                });
            } else {
                pullCalculator.getSegments(false);

                //iterate reversedSegments to get directions
                $.each(pullCalculator.regularSegments, function (i, seg) {
                    directions.push(seg["segment-build-list-slope-direction"].charAt(0));
                });

                //reverse directions
                directions = directions.reverse();
            }

            var activeSegmentsCount = directions.length;
            //Iterate directions backwards
            console.log("🚀 ~ directions:", directions)
            $.each(directions, function (i, v) {
                var _i = i;
                if (!reversed) {
                    _i = activeSegmentsCount - i;
                } else {
                    _i = i + activeSegmentsCount - 1;
                }

                var begin_segment = parseFloat($(
                    ".segments-item .seg_" + _i + " [name='segment-build-list-begin-segment']"
                ).val());

                if (isNaN(begin_segment)) {
                    if (pullCalculator.raceway > 2) {
                        incomingTension_v600 = parseFloat(outgoingTensionNoFixed_v600);
                    }
                } else {
                    incomingTension = begin_segment;

                    if (pullCalculator.raceway > 2) {
                        incomingTension_v600 = parseFloat(begin_segment);
                    }
                }

                if ($(
                    ".segments-item .seg_" + _i + " [name='segment-build-list-begin-segment']"
                ).length > 0 && $(
                    ".segments-item .seg_" + _i + " [name='segment-build-list-begin-segment']"
                ).val() == "Yes") {
                    incomingTension = parseFloat($("#incoming-tension").val());
                }

                var _length = 0;
                var _slope_deg = 0;
                var elbow_angle = 0;
                var elbow_radius = 0;
                if (!reversed && pullCalculator.reverseSegments && pullCalculator.reverseSegments.length > 0) {
                    // Get segments in normal order
                    var segment = pullCalculator.reverseSegments[i];
                    _length = parseFloat(segment["segment-build-list-length"]) || 0;
                    _slope_deg = parseFloat(segment["segment-build-list-slope"]) || 0;
                    elbow_angle = parseFloat(segment["segment-build-list-elbow-angle"]) || 0;
                    elbow_radius = parseFloat(segment["segment-build-list-elbow-radius"]) || 0;
                } else if (reversed && pullCalculator.regularSegments && pullCalculator.regularSegments.length > 0) {
                    // Get segments in reverse order (from the end)
                    var segment = pullCalculator.regularSegments[activeSegmentsCount - 1 - i];
                    _length = parseFloat(segment["segment-build-list-length"]) || 0;
                    _slope_deg = parseFloat(segment["segment-build-list-slope"]) || 0;
                    elbow_angle = parseFloat(segment["segment-build-list-elbow-angle"]) || 0;
                    elbow_radius = parseFloat(segment["segment-build-list-elbow-radius"]) || 0;
                }

                var _overide = parseFloat($("#override-coefficient-friction").val());

                var basic_coef_of_fr = _overide > 0
                    ? _overide
                    : (
                        response && response.coefficient !== undefined
                            ? response.coefficient
                            : 0
                    );

                var basic_coef_of_fr_alt = _overide > 0
                    ? _overide
                    : (
                        response && response.coefficient_alt !== undefined
                            ? response.coefficient_alt
                            : 0
                    );
                var basic_coef_of_fr_v600 = _overide > 0
                    ? _overide
                    : (
                        response && response.coefficient_v600 !== undefined
                            ? response.coefficient_v600
                            : 0
                    );

                pullCalculator.coefficient_of_friction = basic_coef_of_fr;
                pullCalculator.coefficient_of_friction_v600 = basic_coef_of_fr_alt;

                pullCalculator.ECoF = basic_coef_of_fr * parseFloat(
                    pullCalculator.weightCorrection
                ).toFixed(2);
                pullCalculator.ECoF_v600 = basic_coef_of_fr_v600 * parseFloat(
                    pullCalculator.weightCorrection
                ).toFixed(2);

                var pull_BCoF = (basic_coef_of_fr * pullCalculator.weightCorrection).toFixed(2);

                var pull_BCoF_v600 = ((
                    response && response.coefficient_v600 !== undefined
                        ? response.coefficient_v600
                        : 0
                ) * pullCalculator.weightCorrection).toFixed(4);

                /* Calculate SS_PT 
                    Formula =IF($BG78="U",$BH78+(($AT78*$L$55)*(SIN($AR78*PI()/180)+($BJ78*COS($AR78*PI()/180)))),IF($BG78="D",IF($BH78-(($AT78*$L$55)*(SIN($AR78*PI()/180)-($BJ78*COS($AR78*PI()/180))))<0,1,$BH78-(($AT78*$L$55)*(SIN($AR78*PI()/180)-($BJ78*COS($AR78*PI()/180))))),$BH78+($AT78*$L$55*$BJ78)))

                    BG78 = v (U,D,H)
                    BH78 = inputTension
                    AT78 = _length
                    L55 = pullCalculator.totalWeight
                    AR78 = _slope_deg
                    BJ78 = pull_BCoF

                    replace formula with variables
                    if (v == "U") {
                        SS_PT = inputTension + (_length * pullCalculator.totalWeight) * (SIN(_slope_deg * PI()/180) + (pull_BCoF * COS(_slope_deg * PI()/180)))
                    } else if (v == "D") {
                        SS_PT = inputTension - (_length * pullCalculator.totalWeight) * (SIN(_slope_deg * PI()/180) - (pull_BCoF * COS(_slope_deg * PI()/180)))
                        if (SS_PT < 0) { SS_PT = 1 }
                    } else {
                        SS_PT = inputTension + (_length * pullCalculator.totalWeight * pull_BCoF)
                    }
                */
                
                // Calculate SS_PT (Static Sag Tension) with debug logs
                if (v == "U") {
                    SS_PT = inputTension + (_length * pullCalculator.totalWeight) * (Math.sin(_slope_deg * Math.PI/180) + (pull_BCoF * Math.cos(_slope_deg * Math.PI/180)));
                    
                } else if (v == "D") {
                    SS_PT = inputTension - (_length * pullCalculator.totalWeight) * (Math.sin(_slope_deg * Math.PI/180) - (pull_BCoF * Math.cos(_slope_deg * Math.PI/180)));
                    if (SS_PT < 0) { SS_PT = 1 }
                    
                } else {
                    SS_PT = inputTension + (_length * pullCalculator.totalWeight * pull_BCoF);
                    
                }
                
                /* calculate Outgoing Tension 
                    Formula : =(BE76)*2.718^(BQ76*AX76*PI()/180)
                    
                    $BH$61 = Incoming Tension
                    BE77 = SS_PT
                    BQ77 = pull_BCoF
                    AX77 = elbow_angle

                    replace formula with variables
                    (incomingTension) * 2.718^(pull_BCoF * elbow_angle * PI()/180)

                    Alternative formula if previous SS_PT is 1
                    ($BH$61+BE75)*2.718^(BQ75*AX75*PI()/180)

                    replace formula with variables
                    (incomingTension + SS_PT) * 2.718^(pull_BCoF * elbow_angle * PI()/180)
                */

               /*  var reelbackTension = 0
                console.log("🚀 ~ _i:", _i)
                if ((reversed && pullCalculator.reverseSegments[ pullCalculator.reverseSegments.length - 1]["segment-build-list-elbow-angle"] == "" && _i == pullCalculator.regularSegments.length-1) || v == "") {
                    reelbackTension = incomingTension;
                } */

                if (SS_PT == 1) {
                    outgoingTensionNoFixed = inputTension = (incomingTension + SS_PT) * Math.pow(2.718, pull_BCoF * elbow_angle * Math.PI / 180);
                } else {
                    outgoingTensionNoFixed =  inputTension =  (SS_PT) * Math.pow(2.718, pull_BCoF * elbow_angle * Math.PI / 180);
                   /*  outgoingTensionNoFixed = inputTension = (reelbackTension + SS_PT) * Math.pow(2.718, pull_BCoF * elbow_angle * 
                        Math.PI / 180); */
                }

                outgoingTension  = outgoingTensionNoFixed/* The code `.toFixed(2)` is a method in JavaScript that is used
                to format a number with a specific number of digits after the
                decimal point. In this case, it is formatting the number to
                have 2 digits after the decimal point. */
                .toFixed(2);


                var Ri_ft = (elbow_radius / 12).toFixed(3);
                if (pullCalculator.pullConfiguration == "Single") {
                    //AF63/AB63
                    SWBP = outgoingTension / Ri_ft;
                } else if (pullCalculator.pullConfiguration == "Triangular") {
                    //($R$55*AF63)/(2*AB63)
                    SWBP = (pullCalculator.weightCorrection * outgoingTension) / (2 * Ri_ft);
                } else if (pullCalculator.pullConfiguration == "Cradled") {
                    //((3*$R$55)-2)*(AF63/(3*AB63))
                    SWBP = (3 * pullCalculator.weightCorrection - 2) * (
                        outgoingTension / (3 * Ri_ft)
                    );
                } else {
                    //($R$55*AF63)/(2*AB63)

                    SWBP = (pullCalculator.weightCorrection * outgoingTension) / (2 * Ri_ft);
                }

                //if SWBP < 0 then SWBP = 0
                if (SWBP < 0) {
                    SWBP = 0;
                }

                

                SWBP = pullCalculator.roundOrTruncate(SWBP);
                //if swbp is not a number then swbp = 0
                if (isNaN(SWBP)) {
                    SWBP = 0;
                }

                 //if swbp is different than infinity
                outgoingTension = Math.round(outgoingTension);
                // if outgounig tension is different than NaN if maxReverseTensions is >
                // pullCalculator.maxReverseTensions  then maxReverseTensions =
                // pullCalculator.maxReverseTensions
                if (outgoingTension > pullCalculator.maxReverseTensions) {
                    pullCalculator.maxReverseTensions = outgoingTension;
                }

                //pullCalculator.sumTension = outgoingTension; replace dot with comma
                outgoingTension = outgoingTension
                    .toString()
                    .replace(".", ",");

                // Set Values 
                finalLength += _length;
                //= (K63 / 360) * 2 * PI() * L63
                var totallengthOfBend = parseFloat(
                    ((elbow_angle / 360) * 2 * Math.PI * elbow_radius).toFixed(5)
                );

                FinaltotallengthOfBend += totallengthOfBend;

                var tmpTension = parseInt($(
                    ".segments-item .seg_" + _i + " .segment-build-list-tension[type='hidden']"
                ).val());
                tmpTension = isNaN(tmpTension)
                    ? 0
                    : tmpT;
                var tmpSWBP = parseInt($(
                    ".segments-item .seg_" + _i + " .segment-build-list-SWBP[type='hidden']"
                ).val());
                tmpSWBP = isNaN(tmpSWBP)
                    ? 0
                    : tmpSWBP;
                //if SWBP is bigger than the final SWBP
                if (SWBP > finalSWBP) {
                    finalSWBP = SWBP;
                }

                /* End of iteration */
            });

            return {finalSWBP: finalSWBP, finalLength: finalLength, FinaltotallengthOfBend: FinaltotallengthOfBend, maxReverseTensions: pullCalculator.maxReverseTensions};
        },
        summary: function () {
            var summary = $.Deferred();
            var dollarUSLocale = Intl.NumberFormat("en-US");
            pullCalculator.type = $("#conduitType option:selected").html();
            pullCalculator.tradeSize = $("#tradeSize").val();
            pullCalculator.raceway = $("#raceway").val();

            /* Wire ID */
            var wireID1 = (
                $("#information-phase-type option:selected").html() == ""
                    ? "THHN"
                    : $("#information-phase-type option:selected").html()
            ) + $("#information-phase-size option:selected").html();
            var wireID2 = (
                $("#information-ground-type option:selected").html() == ""
                    ? "THHN"
                    : $("#information-ground-type option:selected").html()
            ) + $("#information-ground-size option:selected").html();
            var wireID3 = (
                $("#information-neutral-type option:selected").html() == ""
                    ? "THHN"
                    : $("#information-neutral-type option:selected").html()
            ) + $("#information-neutral-size option:selected").html();

            $(".loadingOverlay").addClass("active");
            if (pullCalculator._ajaxgetConduitID != null) {
                pullCalculator
                    ._ajaxgetConduitID
                    .abort();
            }

            pullCalculator._ajaxgetConduitID = $.ajax({
                async: pullCalculator.ajaxAsync,
                type: "POST",
                url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                data: {
                    action: "getConduitID",
                    Diameter_ID: pullCalculator.type + pullCalculator.raceway + "TRA",
                    tradeSize: $("#tradeSize").val(),
                    wires: {
                        0: wireID1,
                        1: wireID2,
                        2: wireID3
                    },
                    raceway: pullCalculator.raceway,
                    calcType: $("#_mode").val(),
                    nonce: $("#_nonce").val()
                },
                dataType: "json",
                success: function (response) {
                    $(".loadingOverlay").removeClass("active");

                    if (!response.status) {
                        /* Labour Hours */
                        pullCalculator.laborHours = 0;
                        pullCalculator.laborHoursExtra = 0;

                        /* Elbow Labour Hours */
                        pullCalculator.ElbowLaborHours = 0;
                        pullCalculator.ElbowLaborHoursExtra = 0;

                        /* Conduit Size */
                        pullCalculator.CFIconduitSize = 0;

                        /* Maximun Support Distance */
                        pullCalculator.maximunSupportDistance = 0;
                        pullCalculator.maximunSupportDistanceExtra = 0;

                        /* Weight */
                        pullCalculator.weight = 0;
                        pullCalculator.weight_v600 = 0;

                        /* Cable Fault */
                        pullCalculator.comparisonCable = 0;
                        pullCalculator.comparisonCableExtra = 0;
                        return;
                    } else {
                        /* Labour Hours */
                        pullCalculator.laborHours = response.laborHours;
                        //if pullCalculator.laborHours is NaN then pullCalculator.laborHours = 0
                        if (isNaN(pullCalculator.laborHours)) {
                            pullCalculator.laborHours = 0;
                        }
                        pullCalculator.laborHoursExtra = response.laborHoursExtra;
                        // if pullCalculator.laborHoursExtra is NaN then pullCalculator.laborHoursExtra
                        // = 0
                        if (isNaN(pullCalculator.laborHoursExtra)) {
                            pullCalculator.laborHoursExtra = 0;
                        }

                        /* Elbow Labour Hours */
                        pullCalculator.ElbowLaborHours = parseFloat(response.ElbowLaborHours);
                        pullCalculator.ElbowLaborHoursExtra = parseFloat(response.ElbowLaborHoursExtra);

                        /* Conduit Size */
                        pullCalculator.CFIconduitSize = response.angle;

                        /* Maximun Support Distance */
                        pullCalculator.maximunSupportDistance = parseFloat(
                            response.maximunSupportDistance
                        );
                        pullCalculator.maximunSupportDistanceExtra = parseFloat(
                            response.maximunSupportDistanceExtra
                        );

                        /* Weight */
                        pullCalculator.weight = parseFloat(response.weight);
                        pullCalculator.weight_v600 = parseFloat(response.weight_v600);

                        /* Cable Fault */
                        pullCalculator.comparisonCable = response.comparisonCable;
                        pullCalculator.comparisonCableExtra = response.comparisonCableExtra;
                    }

                    /* Cable */
                    var totallengthOfBend = pullCalculator.totallengthOfBend / 12;
                    totallengthOfBend = isNaN(totallengthOfBend)
                        ? 0
                        : totallengthOfBend;
                    var cable = Math.ceil(
                        pullCalculator.totalLength + totallengthOfBend
                    );
                    var numCables = $("#information-phase-cables").val();
                    var _numCables = numCables + " Cables:";
                    if (numCables > 1) {
                        _numCables = numCables + " Cables:";
                    }
                    var CU = $("#information-phase-cu_al").val();
                    var size = $("#information-phase-size option:selected").html();
                    var count = $("#information-phase-ccCount").val();
                    var voltage = $("#information-phase-voltage").val();
                    var v_kv = $("#information-phase-v_kv").val();
                    var armor = $("#information-phase-armor").val();
                    var jacket = $("#information-phase-jacket").val();
                    var groundNumCables = parseInt($("#information-ground-cables").val());
                    //if groundNumCables is NaN then groundNumCables = 0
                    if (isNaN(groundNumCables)) {
                        groundNumCables = 0;
                    }
                    var _groundNumCables = groundNumCables + " GW Cable:";
                    if (groundNumCables > 1) {
                        _groundNumCables = groundNumCables + " GW Cables:";
                    }
                    var groudCU = parseInt($("#information-ground-cu_al").val()) + " ";
                    //if groudCU is NaN then groudCU = 0
                    if (isNaN(groudCU)) {
                        groudCU = 0;
                    }

                    var groudSize = parseInt($("#information-ground-size option:selected").html());
                    //if groudSize is NaN then groudSize = 0
                    if (isNaN(groudSize)) {
                        groudSize = 0;
                    }

                    var phaseCable = cable + " ft: " + _numCables + CU + " " + size + " " +
                            count + " " + voltage + v_kv + " " + armor + " " + jacket;
                    var groundCable = _groundNumCables + groudCU + " " + groudSize;

                    /* Raceway */
                    var raceway = $("#raceway option:selected").html();

                    /* Conduit Condition */
                    var counduitCondition = "New - " + pullCalculator.tradeSize + " " + $(
                        "#conduitType option:selected"
                    ).html();

                    /* conduitFill */
                    //( 100 * =SI(R21=0,0,(((S5/R11)^2)*R5)+(((S6/R11)^2)*R6)+(((S7/R11)^2)*R7)) )

                    var Copper_max_pull = 0;
                    var Aluminum_hard_max_pull = 0;
                    var Copper_SWBP = 0;
                    var Aluminum_SWBP = 0;
                    pullCalculator.ftWeight = 0;
                    var response_ID = 0;
                    var response_ID_v600 = 0;
                    var conduitFill = 0;

                    if (response.status) {
                        Copper_SWBP = response.wire[0]["Copper_SWBP"];
                        Aluminum_SWBP = response.wire[0]["Aluminum_SWBP"];
                        if (response.ID != false) {
                            response_ID = response.ID;
                            pullCalculator.ftWeight = dollarUSLocale
                                .format(response.weight)
                                .replace(",", ".");
                        }

                        response_ID_v600 = response.ID_v600;
                        response_weight = response.weight_v600;
                    } //a

                    var informationPhaseOD = parseFloat($("#information-phase-OD").val());
                    var informationPhaseCables = parseFloat($("#information-phase-cables").val());
                    var informationGroundOD = parseFloat($("#information-ground-OD").val());
                    //if informationGroundOD is NaN then informationGroundOD = 0
                    if (isNaN(informationGroundOD)) {
                        informationGroundOD = 0;
                    }
                    var informationGroundCables = parseFloat($("#information-ground-cables").val());
                    //if informationGroundCables is NaN then informationGroundCables = 0
                    if (isNaN(informationGroundCables)) {
                        informationGroundCables = 0;
                    }

                    var informationNeutraldOD = parseFloat($("#information-neutral-OD").val());
                    //if informationNeutraldOD is NaN then informationNeutraldOD = 0
                    if (isNaN(informationNeutraldOD)) {
                        informationNeutraldOD = 0;
                    }
                    var informationNeutralCables = parseFloat(
                        $("#information-neutral-cables").val()
                    );
                    //if informationNeutralCables is NaN then informationNeutralCables = 0
                    if (isNaN(informationNeutralCables)) {
                        informationNeutralCables = 0;
                    }

                    if (pullCalculator.ftWeight > 0) {
                        conduitFill = Math.pow(informationPhaseOD / response_ID, 2) * informationPhaseCables + Math.pow(
                            informationGroundOD / response_ID,
                            2
                        ) * informationGroundCables;

                        if (mode == "v600") {
                            conduitFill = conduitFill + Math.pow(informationNeutraldOD / response_ID, 2) * informationNeutralCables;
                        }
                        conduitFill = conduitFill * 100;
                    }

                    conduitFill = conduitFill.toFixed(2);

                    pullCalculator.response_ID = response_ID;
                    pullCalculator.response_ID_v600 = response_ID_v600;
                    /* NEC Max */
                    //=SI(R17=1,0.53,SI(R17=2,0.31,0.4))
                    var necMax = 0;
                    if (pullCalculator.cablesSum == 1) {
                        necMax = 0.53 * 100;
                    } else if (pullCalculator.cablesSum == 2) {
                        necMax = 0.31 * 100;
                    } else {
                        necMax = 0.4 * 100;
                    }

                    /* pull-profile-cable-clearance */
                    // =SI(R33=1,R11-R10,SI(R40="Triangular",(R11/2)-(1.366*R10)+((R11-R10)/2)*RAI
                    // Z((1-((R10/(R11-R10))^2))),(R11/2)-(R10/2)+((R11-R10)/2)*RAIZ((1-((R10/(2*(
                    // R11-R10)))^2)))))
                    var cableClearance = 0;
                    var largest_cable_diameter = 0;

                    var phase_OD = parseFloat($("#information-phase-OD").val());
                    var ground_OD = parseFloat($("#information-ground-OD").val());
                    var neutral_OD = parseFloat($("#information-neutral-OD").val());
                    //if neutral_OD is NaN, then neutral_OD = 0
                    if (isNaN(neutral_OD)) {
                        neutral_OD = 0;
                    }

                    largest_cable_diameter = phase_OD;
                    //get the biggest value between phase_OD, ground_OD and neutral_OD
                    if (ground_OD > largest_cable_diameter) {
                        largest_cable_diameter = ground_OD;
                    }

                    var mode = $("#_mode").val();
                    //if mode is v600
                    if (mode == "v600") {
                        if (neutral_OD > largest_cable_diameter) {
                            largest_cable_diameter = neutral_OD;
                        }
                    }

                    if (pullCalculator.pullConfiguration == "Triangular") {
                        //(R11/2)-(1.366*R10)+((R11-R10)/2)*RAIZ((1-((R10/(R11-R10))^2)))
                        cableClearance = response_ID / 2 - 1.366 * largest_cable_diameter + (
                            (response_ID - largest_cable_diameter) / 2
                        ) * Math.sqrt(
                            1 - Math.pow(largest_cable_diameter / (response_ID - largest_cable_diameter), 2)
                        );
                    } else {
                        //(R11/2)-(R10/2)+((R11-R10)/2)*RAIZ((1-((R10/(2*(R11-R10)))^2)))
                        cableClearance = response_ID / 2 - largest_cable_diameter / 2 + (
                            (response_ID - largest_cable_diameter) / 2
                        ) * Math.sqrt(
                            1 - Math.pow(largest_cable_diameter / (2 * (response_ID - largest_cable_diameter)), 2)
                        );
                    }

                    cableClearance = dollarUSLocale.format(cableClearance.toFixed(3));

                    //if cableClearance is NaN, then set it to 0
                    if (isNaN(cableClearance)) {
                        cableClearance = 0;
                    }

                    /* Configuration */
                    var configuration = pullCalculator.pullConfiguration;

                    /* Coefficient of Friction */
                    var _coefficientFriction = $("#override-coefficient-friction").val() != "" && $(
                        "#override-coefficient-friction"
                    ).val() != 0
                        ? " *Override"
                        : "";
                    let tmpCoefficientFriction = parseFloat(pullCalculator.coefficient_of_friction).toFixed(
                        2
                    );
                    //if tmpCoefficientFriction is NaN, then set it to 0
                    if (isNaN(tmpCoefficientFriction)) {
                        tmpCoefficientFriction = 0;
                    }

                    var coefficientFriction = tmpCoefficientFriction + " " +
                            _coefficientFriction;

                    /* Maximum Pulling Limit (PL) */
                    var overrideMaximumPullingLimit = parseFloat(
                        $("#override-maximum-pulling-limit").val()
                    );
                    if (isNaN(overrideMaximumPullingLimit)) {
                        overrideMaximumPullingLimit = 0;
                    }

                    var informationPhaseCables = $("#information-phase-cables").val();
                    var informationGroundCables = parseInt($("#information-ground-cables").val());
                    //if informationPhaseCables is NaN, then set it to 0
                    if (isNaN(informationPhaseCables)) {
                        informationPhaseCables = 0;
                    }
                    var informationPhaseCu_al = $("#information-phase-cu_al").val();
                    var informationGroundCu_al = parseInt($("#information-ground-cu_al").val());
                    //if informationGroundCu_al is NaN, then set it to 0
                    if (isNaN(informationGroundCu_al)) {
                        informationGroundCu_al = 0;
                    }
                    var informationNeutralCu_al = parseFloat($("#information-neutral-cu_al").val());
                    //if informationNeutralCu_al is NaN, then set it to 0
                    if (isNaN(informationNeutralCu_al)) {
                        informationNeutralCu_al = 0;
                    }
                    var phaseCables = parseFloat($("#information-phase-cables").val());
                    //if phaseCables is NaN, then set it to 0
                    if (isNaN(phaseCables)) {
                        phaseCables = 0;
                    }
                    var groundCables = parseFloat($("#information-ground-cables").val());
                    //if groundCables is NaN, then set it to 0
                    if (isNaN(groundCables)) {
                        groundCables = 0;
                    }
                    var neutralCables = parseFloat($("#information-neutral-cables").val());
                    //if neutralCables is NaN, then set it to 0
                    if (isNaN(neutralCables)) {
                        neutralCables = 0;
                    }
                    var countIF = phaseCables > 0
                        ? 1
                        : 0;
                    countIF = groundCables > 0
                        ? countIF + 1
                        : countIF;

                    var maximumPullingLimit = 0;
                    var TC = new Array();
                    var MCT = new Array();

                    pullCalculator.cablesSum = parseInt($("#totalCables").text());

                    if (overrideMaximumPullingLimit > 0) {
                        maximumPullingLimit = overrideMaximumPullingLimit;
                    } else if (pullCalculator.cablesSum > 0) {
                        if (informationPhaseCu_al == "CU") {
                            TC[0] = parseFloat(response.wire[0]["Copper_max_pull"]);
                        } else {
                            TC[0] = parseFloat(response.wire[0]["Aluminum_hard_max_pull"]);
                        }

                        if (informationGroundCu_al == "CU") {
                            TC[1] = parseFloat(response.wire[1]["Copper_max_pull"]);
                        } else {
                            TC[1] = parseFloat(response.wire[1]["Aluminum_hard_max_pull"]);
                        }

                        if (mode == "v600") {
                            TC[2] = 0;
                            MCT[2] = 0;
                            if (informationNeutralCu_al == "CU") {
                                TC[2] = parseFloat(response.wire[2]["Copper_max_pull"]);
                            } else {
                                TC[2] = parseFloat(response.wire[2]["Aluminum_hard_max_pull"]);
                            }
                        }

                        if (phaseCables == 1) {
                            MCT[0] = TC[0];
                        } else {
                            MCT[0] = phaseCables * TC[0];
                        }

                        if (groundCables == 1) {
                            MCT[1] = TC[1];
                        } else {
                            MCT[1] = groundCables * TC[1];
                        }

                        if (mode == "v600") {
                            if (neutralCables == 1) {
                                MCT[2] = TC[2];
                            } else {
                                MCT[2] = neutralCables * TC[2];
                            }
                        }

                        var tmpSum = 0;
                        if (countIF == 1) {
                            maximumPullingLimit = MCT[0] + MCT[1];
                            if (mode == "v600") {
                                maximumPullingLimit = maximumPullingLimit + MCT[2];
                            }
                        } else {
                            tmpSum = phaseCables * parseFloat(TC[0]) + groundCables * parseFloat(TC[1]);

                            if (mode == "v600") {
                                tmpSum = tmpSum + neutralCables * parseFloat(TC[2]);
                            }

                            tmpSum = tmpSum * 0.8;

                            if (tmpSum > 9999 || tmpSum == 0) {
                                maximumPullingLimit = 10000;
                            } else if (countIF == 1) {
                                maximumPullingLimit = MCT[0] + MCT[1];
                                if (mode == "v600") {
                                    maximumPullingLimit = maximumPullingLimit + MCT[2];
                                }
                            } else {
                                maximumPullingLimit = tmpSum;
                            }
                        }
                    }

                    maximumPullingLimit = pullCalculator.roundOrTruncate(maximumPullingLimit);

                    /* Max. Continuous Tension */
                    var continousTension = "";
                    if (pullCalculator.sumTension > maximumPullingLimit && maximumPullingLimit > 0) {
                        continousTension = "Exceeds Limit > Max PL";
                        //> Max PL
                    } else {
                        continousTension = dollarUSLocale.format(pullCalculator.sumTension) + " lbs";
                    }

                    pullCalculator.maximumPullingLimit = maximumPullingLimit;
                    maximumPullingLimit = dollarUSLocale.format(maximumPullingLimit);

                    /* Max. Continuous Tension */
                    pullCalculator.sumLengths = 0;
                    pullCalculator.supportExtra = 0;
                    pullCalculator.supportDistance = 0;
                    pullCalculator.supportDistanceExtra = 0;
                    var runningTensionMax = 0;
                    var outgoingTension = 0;
                    var ECoF = pullCalculator.coefficient_of_friction != ""
                        ? pullCalculator.coefficient_of_friction
                        : response.coefficient;
                    var reverseECoF = ECoF * pullCalculator.weightCorrection;
                    var AB = 0;
                    var incomingTension = parseFloat($("#incoming-tension").val());

                    for (let i = 0; i <= pullCalculator.directions.length; i++) {
                        outgoingTension = parseFloat(outgoingTension);
                        var v = pullCalculator.directions[i];
                        if (v == "D") {
                            v = "U";
                        } else if (v == "U") {
                            v = "D";
                        }

                        var listLength = parseFloat($(".segments-item .seg_" + (
                            i + 1
                        ) + " [name='segment-build-list-length']").val());
                        if (!isNaN(listLength)) {
                            pullCalculator.sumLengths += listLength;
                            pullCalculator.supportDistance += Math.ceil(
                                listLength / pullCalculator.maximunSupportDistance + 1
                            );
                            pullCalculator.supportDistanceExtra += Math.ceil(
                                listLength / pullCalculator.maximunSupportDistanceExtra + 1
                            );
                        }
                        var _length = parseFloat($(".segments-item .seg_" + (
                            i + 1
                        ) + " [name='segment-build-list-length']").val());
                        var _slope_deg = parseFloat($(".segments-item .seg_" + (
                            i + 1
                        ) + " [name='segment-build-list-slope']").val());
                        var elbow_angle = parseFloat($(
                            ".segments-item .seg_" + i + " [name='segment-build-list-elbow-angle']"
                        ).val());
                        var elbow_radius = parseFloat($(
                            ".segments-item .seg_" + i + " [name='segment-build-list-elbow-radius']"
                        ).val());

                        if (isNaN(_length)) {
                            _length = 0;
                        }

                        if (isNaN(_slope_deg)) {
                            _slope_deg = 0;
                        }

                        if (isNaN(elbow_angle)) {
                            elbow_angle = 0;
                        }

                        if (isNaN(elbow_radius)) {
                            elbow_radius = 0;
                        }

                        if (v == "U") {
                            //$BH72+(($AT72*$L$55)*(SENO($AR72*PI()/180)+($BJ72*COS($AR72*PI()/180))))
                            AB = outgoingTension + _length * pullCalculator.totalWeight * (
                                Math.sin((_slope_deg * Math.PI) / 180) + reverseECoF * Math.cos((_slope_deg * Math.PI) / 180)
                            );
                        } else if (v == "D") {
                            //$BH73-(($AT73*$L$55)*(SENO($AR73*PI()/180)-($BJ73*COS($AR73*PI()/180))))
                            AB = outgoingTension - _length * pullCalculator.totalWeight * (
                                Math.sin((_slope_deg * Math.PI) / 180) - reverseECoF * Math.cos((_slope_deg * Math.PI) / 180)
                            );
                            if (AB < 1) {
                                AB = 1;
                            }
                        } else {
                            //$BH80+($AT80*$L$55*$BJ80)
                            /* AB =
                outgoingTension +
                _length * pullCalculator.totalWeight * reverseECoF; */
                            AB = outgoingTension + _length * pullCalculator.totalWeight * reverseECoF;
                        }

                        if (pullCalculator.directions.length == i) {
                            //($BH$61+BE63)*2.718^(BQ63*AX63*PI()/180)
                            outgoingTension = (incomingTension + AB) * Math.pow(
                                2.718,
                                (reverseECoF * elbow_angle * Math.PI) / 180
                            );
                        } else {
                            //(BE63)*2.718^(BQ63*AX63*PI()/180)
                            outgoingTension = AB * Math.pow(
                                2.718,
                                (reverseECoF * elbow_angle * Math.PI) / 180
                            );
                        }

                        outgoingTension = outgoingTension.toFixed(2);
                        runningTensionMax = pullCalculator.roundOrTruncate(outgoingTension);
                    }

                    /* Jam Probability */
                    var percentage = 0;

                    var jamProbability = (response_ID * (1 - percentage)) / largest_cable_diameter;

                    //number to 2 decimal places
                    jamProbability = jamProbability.toFixed(2);

                    jamProbability = dollarUSLocale
                        .format(jamProbability)
                        .replace(",", ".");

                    var jamValue = 0;
                    var maximumSwbpLimit = new Array();
                    const keys = Object
                        .keys(pullCalculator.jamProbabilityList)
                        .sort();
                    for (let x of keys) {
                        if (jamProbability >= parseFloat(x)) {
                            jamValue = pullCalculator.jamProbabilityList[x];
                        }
                    }
                    //jamProbability = jamProbability.toString().slice(0, 4);

                    /* Maximum SWBP Limit (PL) */
                    var minmaximumPullingLimit = 0;
                    if (informationPhaseCu_al == "CU") {
                        maximumSwbpLimit[0] = parseFloat(Copper_SWBP);
                        minmaximumPullingLimit = maximumSwbpLimit[0];
                        maximumSwbpLimit[1] = parseFloat(Aluminum_SWBP);
                    }

                    if (maximumSwbpLimit[1] < minmaximumPullingLimit) {
                        minmaximumPullingLimit = maximumSwbpLimit[1];
                    }

                    if ($("#override-maximum-SWBP-limit").val() != "") {
                        minmaximumPullingLimit = parseFloat($("#override-maximum-SWBP-limit").val());
                    }

                    pullCalculator.minmaximumPullingLimit = minmaximumPullingLimit;

                    var maximumSwbpLimitText = "lbs";
                    if (overrideMaximumPullingLimit > 0) {
                        maximumSwbpLimitText = "Override";
                    }
                    //$("#profile_sub_title_maximum-swbp-limit").text(maximumSwbpLimitText);

                    /* Length of SS / B / Total */
                    /* # of supports */
                    var numOfSupports = Math.ceil(pullCalculator.totallengthOfBend / 12);
                    var Length_SS_B_Total = dollarUSLocale.format(pullCalculator.sumLengths) +
                            " / " + numOfSupports + " / " + dollarUSLocale.format(
                        pullCalculator.sumLengths + numOfSupports
                    );

                    /* Set Values */
                    $("#pull-profile-cable").text(phaseCable + " " + groundCable);
                    $("#pull-profile-raceway").text(raceway);
                    $("#pull-profile-condition").text(counduitCondition);
                    $("#pull-profile-conduit-ID").text(
                        dollarUSLocale.format(response_ID) + " in"
                    );
                    $("#pull-profile-conduit-fill").text(
                        dollarUSLocale.format(conduitFill) + " %"
                    );
                    $("#pull-profile-NEC-max").text(necMax + " %");

                    $("#pull-profile-cable-clearance").text(cableClearance + " in");

                    if ($("#override-pull-configuration").val() != "") {
                        $("#pull-profile-configuration").text(configuration + " *Override");
                        $("#pullConfiguration")
                            .addClass("redText")
                            .text(configuration + " *");
                        $("#weightCorrection")
                            .addClass("redText")
                            .text(pullCalculator.weightCorrection + " *");
                    } else {
                        $("#pullConfiguration")
                            .removeClass("redText")
                            .text($("#pullConfiguration").attr("data-original"));
                        $("#pull-profile-configuration").text(configuration);
                        $("#weightCorrection")
                            .removeClass("redText")
                            .text(pullCalculator.weightCorrection);
                    }

                    $("#pull-profile-coefficient-friction").text(coefficientFriction);
                    $("#pull-profile-weight-correction").text(pullCalculator.weightCorrection);

                    if ($("#override-maximum-pulling-limit").val() != "") {
                        $("#pull-maximum-pulling-limit").addClass("redText");
                        $("#pull-maximum-pulling-limit").text(
                            maximumPullingLimit + " lbs *Override"
                        );
                    } else {
                        $("#pull-maximum-pulling-limit").removeClass("redText");
                        $("#pull-maximum-pulling-limit").text(maximumPullingLimit + " lbs");
                    }

                    /* Calculate Backwards */
                    if ($(".seg_1 .segment-build-list-tension").val() != "" && $("#changeSegmentsDirection").hasClass("reverse")) {

                        if (pullCalculator.reverseSegments === undefined || pullCalculator.reverseSegments === null || pullCalculator.reverseSegments.length === 0 && $("#changeSegmentsDirection").hasClass("reverse")) {
                            pullCalculator.changeSegmentsOrder();
                        }

                        var _cloned = (pullCalculator.reverseSegments).map(
                            seg => Object.assign({}, seg)
                        );

                        var indexArray = new Array();
                        var indexDirection = "";
                        var _directions = new Array();
                        indexArray[""] = 1;
                        indexArray["Horizontal"] = 1;
                        indexArray["Up"] = 2;
                        indexArray["Down"] = 3;

                        for (var i = _cloned.length; i >= 1; i--) {
                            segmentbuildlistslopedirection = _cloned[i - 1]["segment-build-list-slope-direction"];

                            //change Up to Down and Down to Up
                            if (segmentbuildlistslopedirection == "Up") {
                                _directions.push("U");
                                segmentbuildlistslopedirection = "Up";
                            } else if (segmentbuildlistslopedirection == "Down") {
                                segmentbuildlistslopedirection = "Down";
                                _directions.push("D");
                            } else if (segmentbuildlistslopedirection != "Vertical") {
                                _directions.push("H");
                            }

                            var _direction1 = 0;
                            _direction1 = indexArray[segmentbuildlistslopedirection];
                            if (_direction1 == undefined) {
                                continue;
                            }

                            var _direction2 = 0;

                            indexDirection += _direction1 + "" + _direction2 + "&";
                        }
                        //remove last &
                        indexDirection = indexDirection.substring(0, indexDirection.length - 1);

                        pullCalculator._ajaxSegments = $.ajax({
                            type: "POST",
                            async: false,
                            url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                            data: {
                                async: pullCalculator.ajaxAsync,
                                action: "calculateSegments",
                                segments: indexDirection,
                                raceway: pullCalculator.raceway,
                                jacket: jacket,
                                coefficient_column: pullCalculator.coefficient_of_friction_column,
                                cableSum: pullCalculator.cablesSum,
                                pullConfiguration: pullCalculator.pullConfiguration,
                                maxLength: pullCalculator.maxLength,
                                pipetype: pullCalculator.type,
                                calcType: $("#_mode").val(),
                                nonce: $("#_nonce").val()
                            },
                            dataType: "json",
                            success: function (response) {
                                $(".loadingOverlay").removeClass("active");
                                if (response.status) {
                                    //Continuous section

                                    pullCalculator.calculateComparisonALT(response, _directions);

                                    $.toast(
                                        {heading: "Calculating", showHideTransition: "slide", icon: "success", stack: false, position: "bottom-left"}
                                    );
                                }
                            }
                        });
                    }
                    /* Calculate Backwards END*/

                    $("#pull-continuous-tension").text(continousTension);
                    $("#pull-reverse-tension").text(
                        dollarUSLocale.format(pullCalculator.maxReverseTensions) + " lbs"
                    );
                    $("#pull-jam-probability").text(
                        dollarUSLocale.format(jamProbability) + " " + jamValue
                    );

                    if ($("#override-maximum-SWBP-limit").val() != "") {
                        $("#pull-maximum-swbp-limit").addClass("redText");

                        //remove *Override word if already exist on maximumSwbpLimitText
                        maximumSwbpLimitText = maximumSwbpLimitText.replace("Override", "");

                        $("#pull-maximum-swbp-limit").text(
                            dollarUSLocale.format(minmaximumPullingLimit) + " " + maximumSwbpLimitText + " " +
                            "*Override"
                        );
                    } else {
                        $("#pull-maximum-swbp-limit").removeClass("redText");
                        $("#pull-maximum-swbp-limit").text(
                            dollarUSLocale.format(minmaximumPullingLimit) + " " + maximumSwbpLimitText
                        );
                    }

                    $("#pull-Length_SS_B_Total").text(Length_SS_B_Total + " ft");

                    /* Reset validations */
                    $("#pull-profile-conduit-fill")
                        .parent()
                        .removeClass("redBackground pinkBackground");
                    $("#pull-profile-NEC-max")
                        .parent()
                        .removeClass("redBackground pinkBackground");
                    $("#conduitType")
                        .parent()
                        .removeClass("redBackground pinkBackground");
                    $("#minimumTrade")
                        .parent()
                        .removeClass("redBackground pinkBackground");
                    $("#pull-profile-cable-clearance")
                        .parent()
                        .removeClass("redBackground pinkBackground");
                    $("#pull-jam-probability")
                        .parent()
                        .removeClass("redBackground pinkBackground");
                    $("#pull-continuous-tension")
                        .parent()
                        .removeClass("redBackground pinkBackground purpleBackground");
                    $("#pull-maximum-pulling-limit")
                        .parent()
                        .removeClass("redBackground pinkBackground purpleBackground");
                    $("#pull-maximum-swbp-limit")
                        .parent()
                        .removeClass("redBackground pinkBackground");
                    $("#tradeSize")
                        .parent()
                        .removeClass("redBackground pinkBackground");
                    $("#minimumTrade")
                        .parent()
                        .removeClass("redBackground pinkBackground");

                    /* Validations */
                    if (conduitFill > necMax + 0.49) {
                        $("#pull-profile-conduit-fill").text(conduitFill + " % error");
                        $("#pull-profile-conduit-fill")
                            .parent()
                            .addClass("redBackground");
                        $("#pull-profile-NEC-max")
                            .parent()
                            .addClass("redBackground");
                        $("#tradeSize")
                            .parent()
                            .addClass("redBackground");
                        $("#minimumTrade")
                            .parent()
                            .addClass("redBackground");

                        if (pullCalculator.weightCorrection > 0) {
                            $("#pull-profile-cable-clearance")
                                .parent()
                                .addClass("redBackground");
                            $("#conduitType")
                                .parent()
                                .addClass("redBackground");
                            $("#minimumTrade")
                                .parent()
                                .addClass("redBackground");
                        }
                    }

                    if (cableClearance < 1 || cableClearance < 0.1 * response_ID) {
                        $("#pull-profile-cable-clearance")
                            .parent()
                            .addClass("redBackground");
                    }

                    //if coefficientFriction is different than empty add red text
                    if ($("#override-coefficient-friction").val() == "" || $("#override-coefficient-friction").val() == 0) {
                        $("#pull-profile-coefficient-friction")
                            .parent()
                            .removeClass("redText");
                    } else {
                        $("#pull-profile-coefficient-friction")
                            .parent()
                            .addClass("redText");
                    }

                    // if Max continuous tension is bigger than Maximun pulling limit add purple
                    // background

                    if (parseFloat(pullCalculator.sumTension) > parseFloat(pullCalculator.maximumPullingLimit)) {
                        $("#pull-continuous-tension")
                            .parent()
                            .addClass("purpleBackground");
                        $("#pull-maximum-pulling-limit")
                            .parent()
                            .addClass("purpleBackground");
                    }

                    //If Maximum SWBP is bigger than SMBP sum add pink background
                    if (parseFloat(pullCalculator.maxSWBP) > parseFloat(pullCalculator.minmaximumPullingLimit)) {
                        $("#pull-maximum-swbp-limit")
                            .parent()
                            .addClass("pinkBackground");
                    }

                    //jamValue is equal to "Significant" add red background
                    if (jamValue == "Significant") {
                        $("#pull-jam-probability")
                            .parent()
                            .addClass("redBackground");
                    }

                    /* Fix size boxes */
                    $("#pullProfileSummary label").css("height", "auto");
                    $("#pullProfileSummary .form-group").each(function (index, element) {
                        var sizeBox = 0;
                        $(this)
                            .find("label")
                            .each(function (index, element) {
                                var tmp = $(this).outerHeight();
                                if (tmp > sizeBox) {
                                    sizeBox = tmp;
                                }
                            });
                        $(element)
                            .find("label")
                            .css("height", sizeBox);
                    });

                    setTimeout(() => {
                        summary.resolve();
                    }, 300);
                }
            });

            return $
                .when(summary)
                .done(function () {
                    pullCalculator.validations();
                    if (pullCalculator.debug) {
                        console.log("summary task is done");
                    }
                })
                .promise();
        },
        formatNumber: function (number) {
            if (number > 1000) {
                var number = number.toString();
                var dollarUSLocale = Intl.NumberFormat("en-US");
                number = dollarUSLocale
                    .format(number)
                    .replace(".", "");

                //find second comma on number
                var comma = number.indexOf(",", number.indexOf(",") + 1);
                if (comma == -1) {
                    number = number.replace(",", ".");
                    number = parseFloat(number).toFixed(3);
                } else {
                    var decimals = number.substring(comma + 1);
                    var tousands = number.substring(0, comma);
                    number = tousands + "." + decimals;
                }
            }

            return number;
        },
        calculateDifference: function (value1, value2) {
            var difference = 0;
            
            value = parseFloat(value1);
            value2 = parseFloat(value2);

            //if value1 or value2 is bigger than 0 replace . with ,
            if (value1 > 1) {
                value1 = value1.toString().replace(".", "");
            }

            if (value2 > 1) {
                value2 = value2.toString().replace(".", "");
            }
            
            difference = pullCalculator.roundOrTruncate(((value2 - value1) / value1) * 100);

            return difference;
        },
        comparison: function () {
            var comparison = $.Deferred();

            //if cancelCalculations is true then return
            if (pullCalculator.cancelCalculations) {
                //set cancelCalculations to false
                comparison.resolve();
            }

            var dollarUSLocale = Intl.NumberFormat("en-US");
            var comparisonmaximumsupport = 0;

            var segments = 0;
            $.each(
                $(".segments-item [name='segment-build-list-elbow-radius']"),
                function (indexInArray, valueOfElement) {
                    if ($(this).val() != "") {
                        segments++;
                    }
                }
            );

            /* Enable second section */
            if (pullCalculator.raceway > 2) {
                $("#comparisonTypes .hideGroup").removeClass("hide");
            } else {
                $("#comparisonTypes .hideGroup").addClass("hide");
            }

            // Extra
            var laborHours = pullCalculator.raceway > 2
                ? pullCalculator.laborHoursExtra
                : pullCalculator.laborHours;
            //if laborHours is not number set to 0
            if (laborHours == "") {
                laborHours = 0;
            }
            var comparisonInstallHours = 0;
            /* Install Man/Hrs Est. (NECA 2022) */
            var comparisonInstallHoursExtra = 0;
            var comparisonInstallHoursExtraPercentage = 0;

            comparisonInstallHours = pullCalculator.roundOrTruncate(
                (pullCalculator.sumLengths / 100) * laborHours + segments * pullCalculator.ElbowLaborHoursExtra
            );
            if (isNaN(comparisonInstallHours)) {
                comparisonInstallHours = 0;
            }

            comparisonInstallHoursExtra = pullCalculator.roundOrTruncate(
                Math.round((parseFloat(pullCalculator.sumLengths) / 100) * parseFloat(pullCalculator.laborHours) + segments * parseFloat(pullCalculator.ElbowLaborHours))
            );

            //if comparisonInstallHoursExtra is not number set to 0
            if (isNaN(comparisonInstallHoursExtra)) {
                comparisonInstallHoursExtra = 0;
            }

            comparisonInstallHoursExtraPercentage = pullCalculator.calculateDifference(
                comparisonInstallHours,
                comparisonInstallHoursExtra
            );

            //if comparisonInstallHoursExtraPercentage is infinity set to 0
            if (comparisonInstallHoursExtraPercentage === Infinity) {
                comparisonInstallHoursExtraPercentage = 0;
            }

            $("#comparison-install-hours-pvc").addClass("hide");
            if (pullCalculator.raceway == 3) {
                $("#comparison-install-hours-pvc").removeClass("hide");
            }

            /* Maximum Support */
            var maximumSupport = 0;
            var maximumSupportExtra = 0;
            var comparisonmaximumsupport = 0;
            if (pullCalculator.raceway == 1 || pullCalculator.raceway == 2) {
                maximumSupportExtra = maximumSupport = pullCalculator.maximunSupportDistance;
            } else {
                var tmp = pullCalculator.sumTension;
                tmp = pullCalculator.formatNumber(tmp);
                maximumSupportExtra = tmp;

                /* Champ */
                var tmp = pullCalculator.sumTensionALT;
                tmp = pullCalculator.formatNumber(tmp);
                maximumSupport = tmp;

            }

            if (pullCalculator.debug) {
                console.log(
                    "🚀 ~ file: power_cable_calc.js:3377 ~ maximumSupportExtra:",
                    maximumSupportExtra
                );
                console.log(
                    "🚀 ~ file: power_cable_calc.js:3377 ~ maximumSupport:",
                    maximumSupport
                );
            }

            var comparisonMaximumLabel = pullCalculator.raceway <= 2
                ? "Maximum Support Distance (ft)"
                : "Max. Continuous Tension (lbs)";

            /* Coefficient of Friction */
            var comparisonCoefficientFrictionExtraPercentage = 0;
            var coefficientFriction = pullCalculator.coefficient_of_friction;
            //number to 2 decimal places
            coefficientFriction_v600 = coefficientFriction = parseFloat(
                coefficientFriction
            ).toFixed(2);

            /* Coefficient of Friction */
            var coefficientFriction_v600 = 0;
            if (pullCalculator.raceway > 2) {
                coefficientFriction = parseFloat(pullCalculator.coefficient_of_friction_v600).toFixed(
                    2
                );
                coefficientFriction_v600 = parseFloat(pullCalculator.coefficient_of_friction).toFixed(
                    2
                );
            }

            /* comparisonCoefficientFrictionExtraPercentage = pullCalculator.roundOrTruncate(
                ((coefficientFriction_v600 - coefficientFriction) / coefficientFriction) * 100
            ); */

            comparisonCoefficientFrictionExtraPercentage = pullCalculator.calculateDifference(
                pullCalculator.coefficient_of_friction,
                pullCalculator.coefficient_of_friction_v600
            );

            /* Total Conduit Weight (lbs) */
            var comparisontotalConduitWeight = 
                pullCalculator.sumLengths * pullCalculator.weight_v600 + pullCalculator.weight_v600 * Math.ceil(pullCalculator.totallengthOfBend / 12)

            var comparisontotalConduitWeightExtra = pullCalculator.roundOrTruncate(
                Math.ceil(pullCalculator.sumLengths * pullCalculator.weight) + pullCalculator.weight * Math.ceil(pullCalculator.totallengthOfBend / 12)
            );

            if (pullCalculator.raceway < 3) {
                comparisontotalConduitWeight = comparisontotalConduitWeightExtra;
            }

            var comparisontotalConduitWeightExtraPercentage = 0;
            comparisontotalConduitWeightExtraPercentage = Math.ceil(
                ((comparisontotalConduitWeight - comparisontotalConduitWeightExtra) / comparisontotalConduitWeightExtra) * 100
            );

            if (isNaN(comparisontotalConduitWeightExtraPercentage)) {
                comparisontotalConduitWeightExtraPercentage = 0;
            }

            comparisontotalConduitWeight = Math.ceil(comparisontotalConduitWeight);

            /* Cable Fault */
            var comparisonCable = pullCalculator.comparisonCable;
            var comparisonCableExtra = "No Affected";
            if (pullCalculator.comparisonCableExtra == 0) {
                comparisonCableExtra = pullCalculator.comparisonCableExtra;
            }

            /* Estimated Number of Supports */
            var comparisonEstimatedNumbersSupport = 0;
            var comparisonEstimatedNumbersSupportExtra = 0;
            var comparisonEstimatedNumbersSupportPercentage = 0;
            //If value is infinite
            if (pullCalculator.supportDistance != Infinity) {
                comparisonEstimatedNumbersSupport = pullCalculator.supportDistance;
                comparisonEstimatedNumbersSupportExtra = pullCalculator.supportDistanceExtra;

                //if comparisonEstimatedNumbersSupportExtra is not number set to 0
                if (isNaN(comparisonEstimatedNumbersSupportExtra)) {
                    comparisonEstimatedNumbersSupportExtra = 0;
                }
                comparisonEstimatedNumbersSupportPercentage = pullCalculator.roundOrTruncate(
                    ((comparisonEstimatedNumbersSupport - comparisonEstimatedNumbersSupportExtra) / comparisonEstimatedNumbersSupportExtra) * 100
                );

                //if comparisonEstimatedNumbersSupportPercentage is not number set to 0
                if (isNaN(comparisonEstimatedNumbersSupportPercentage)) {
                    comparisonEstimatedNumbersSupportPercentage = 0;
                }
                //if comparisonEstimatedNumbersSupportPercentage is infinite set to 0
                if (comparisonEstimatedNumbersSupportPercentage == Infinity) {
                    comparisonEstimatedNumbersSupportPercentage = 0;
                }
            }

            /* Raceway */
            var comparisonRacewayTitle = $("#raceway option:selected").html();

            /* Material Cost */
            //var comparisonMaterialCost = "$/100";

            /* Comparison maximum label */
            var comparisonMaximumLabel = pullCalculator.raceway <= 2
                ? "Maximum Support Distance (ft)"
                : "Max. Continuous Tension (lbs)";

            /* Set Values */
            //Install Hours
            var dollarUSLocale = Intl.NumberFormat("en-US");
            $("#comparison-install-hours").text(comparisonInstallHoursExtra);

            $("#comparison-install-hours-extra").text(
                comparisonInstallHoursExtraPercentage + " %"
            );

            $("#comparison-install-hours-extra-compare").text(comparisonInstallHours);

            //comparison-maximum-support
            if (comparisonmaximumsupport == 0) {
                comparisonMaximumLabel = fixedmaximumSupportExtra;
            }
            $("#comparison-maximum-label").text(comparisonMaximumLabel);

            /* maximumSupport = maximumSupport / 100; */
            //replace comma with dot
            
            console.log("🚀 ~ maximumSupport:", maximumSupport);

            maximumSupport = maximumSupport.toString().replace(",", ".");
            //get decimals after dot if decimals after dot is les than 0.05 set to 0
            if (maximumSupport % 1 < 0.2 && Math.round(maximumSupport) == maximumSupportExtra) {
                maximumSupport = Math.round(maximumSupport);
            }

            //maximumSupport = dollarUSLocale.format(maximumSupport);
            var fixedmaximumSupport = maximumSupport
                .toString()
                .replace(".", ",");

            if (maximumSupportExtra % 1 < 0.05) {
                maximumSupportExtra = Math.floor(maximumSupportExtra);
            }
            //maximumSupportExtra = dollarUSLocale.format(maximumSupportExtra);

            /*  maximumSupportExtra = maximumSupportExtra / 100; */
            var fixedmaximumSupportExtra = maximumSupportExtra
                .toString()
                .replace(".", ",");

            $("#comparison-maximum-support").text(fixedmaximumSupport);

            //remove all non numeric characters
            var _fixedmaximumSupportExtra = fixedmaximumSupportExtra.replace(
                /[^0-9.]/g,
                ""
            );
            //if fixedmaximumSupportExtra is NaN set to 0
            if (isNaN(_fixedmaximumSupportExtra)) {
                fixedmaximumSupportExtra = 0;
            }
            $("#comparison-maximum-support-compare").text(fixedmaximumSupportExtra);


            comparisonmaximumsupport = pullCalculator.calculateDifference(
                maximumSupportExtra,
                maximumSupport,
            );

            if (isNaN(comparisonmaximumsupport)) {
                comparisonmaximumsupport = 0;
            }

            $("#comparison-maximum-support-extra").text(comparisonmaximumsupport + " %");
            /*  } */

            /* comparison-coefficient-friction */
            //coefficientFriction is not a number set to 0
            if (isNaN(coefficientFriction)) {
                coefficientFriction = 0;
            }
            $("#comparison-coefficient-friction").text(coefficientFriction);

            //coefficientFriction_v600 is not a number set to 0
            if (isNaN(coefficientFriction_v600)) {
                coefficientFriction_v600 = 0;
            }
            $("#comparison-coefficient-friction-compare").text(coefficientFriction_v600);

            //comparisonCoefficientFrictionExtraPercentage is not a number set to 0
            if (isNaN(comparisonCoefficientFrictionExtraPercentage)) {
                comparisonCoefficientFrictionExtraPercentage = 0;
            }

            $("#comparison-coefficient-friction-extra").text(
                comparisonCoefficientFrictionExtraPercentage + " %"
            );
            

            /* omparison-total-conduit-weight- */
            $("#comparison-total-conduit-weight").text(
                dollarUSLocale.format(comparisontotalConduitWeight)
            );
            $("#comparison-total-conduit-weight-extra-compare").text(
                dollarUSLocale.format(comparisontotalConduitWeightExtra)
            );
            $("#comparison-total-conduit-weight-extra").text(
                comparisontotalConduitWeightExtraPercentage + " %"
            );

            /*  */

            $("#comparison-estimated-numbers-support").text(
                dollarUSLocale.format(comparisonEstimatedNumbersSupport)
            );
            $("#comparison-raceway-title").html(
                "<span>" + comparisonRacewayTitle + "</span>"
            );

            /*  */

            $("#comparison-estimated-numbers-support-extra").text(
                comparisonEstimatedNumbersSupportPercentage + " %"
            );

            //if comparisonEstimatedNumbersSupportExtra is infinite set to 0
            if (comparisonEstimatedNumbersSupportExtra === Infinity) {
                comparisonEstimatedNumbersSupportExtra = 0;
            }
            $("#comparison-estimated-numbers-support-extra-compare").text(
                dollarUSLocale.format(comparisonEstimatedNumbersSupportExtra)
            );

            /* omparison-cable-fault */
            var comparisonChart = {
                1: "No Affected",
                2: "No Affected",
                3: "Melt / Fuse",
                4: "Melt / Fuse",
                5: "",
                6: "Weld",
                7: "Weld",
                8: "Weld"
            };
            $("#comparison-cable-fault").text(comparisonCable);
            $("#comparison-cable-fault-extra").text(
                comparisonChart[pullCalculator.raceway]
            );
            /* $("#comparison-material-cost-extra").text(comparisonMaterialCostExtra); */

            setTimeout(() => {
                comparison.resolve();
            }, 300);

            return $
                .when(comparison)
                .done(function () {
                    /* Disable no userFill inputs */
                    setTimeout(() => {
                        $(
                            "#powerCalculatorContainer input:not(.userFill), #powerCalculatorContainer sele" +
                            "ct:not(.userFill)"
                        ).prop("disabled", true);
                    }, 800);
                    if (pullCalculator.debug) {
                        console.log("comparison task is done");
                    }
                })
                .promise();
        },
        roundOrTruncate: function (num) {
            if (num >= parseInt(num) + 0.6) {
                return Math.ceil(num);
            } else {
                return Math.floor(num);
            }
        },
        fixBoxesSizes: function () {
            var three_boxes_Size = 0;
            $(".three_boxes .information").each(function (index, element) {
                if ($(this).outerHeight() > three_boxes_Size) {
                    three_boxes_Size = $(this).outerHeight();
                }
            });
            $(".three_boxes .information").css("min-height", three_boxes_Size);

            var two_boxes_Size = 0;
            $(".two_boxes.middle_section .information").each(function (index, element) {
                if ($(this).outerHeight() > two_boxes_Size) {
                    two_boxes_Size = $(this).outerHeight();
                }
            });
            $(".two_boxes.middle_section .information").css("min-height", two_boxes_Size);

            var two_boxes_Size = 0;
            $(".two_boxes.bottom_section .information").each(function (index, element) {
                if ($(this).outerHeight() > two_boxes_Size) {
                    two_boxes_Size = $(this).outerHeight();
                }
            });
            $(".two_boxes.bottom_section .information").css("min-height", two_boxes_Size);
        },
        removeSection: function (e) {
            var answer = confirm("Are you sure you want to delete this section?");

            if (answer) {
                $(e)
                    .closest(".segments-item")
                    .remove();
                pullCalculator.segment -= 1;
            }
        },
        checkFields: function () {
            $("#powerCalculatorContainer")
                .off()
                .on("change", "input, select, textarea", function (e) {
                    var parent = $(e.target).closest(".projectInformation");
                    pullCalculator.enableNextStep(parent, e.target);
                });
        },
        enableNextStep: function (parent, target) {
            var complete = true;
            $(parent)
                .find("input")
                .each(function (index, element) {
                    if ($(element).attr("type") != "hidden") {
                        if ($(element).val() == "" && $(element).is(":visible") && !$(element).hasClass("noRequired")) {
                            complete = false;
                            $(element).addClass("error");
                        } else {
                            $(element).removeClass("error");
                        }
                    }
                });
            $(parent)
                .find("select")
                .each(function (index, element) {
                    if ($(element).val() == "" && $(element).is(":visible") && $(element).attr("disabled") != "disabled" && !$(element).hasClass("noRequired")) {
                        complete = false;
                        $(element).addClass("error");
                    } else {
                        $(element).removeClass("error");
                    }
                });
            $(parent)
                .find("textarea")
                .each(function (index, element) {
                    if ($(element).val() == "" && $(element).is(":visible") && !$(element).hasClass("noRequired")) {
                        complete = false;
                        $(element).addClass("error");
                    } else {
                        $(element).removeClass("error");
                    }
                });
            if (complete) {
                /* Override value */
                if ($(target).attr("name") == "segment-build-list-tension" || $(target).attr("name") == "segment-build-list-SWBP") {
                    $(target).addClass("override");
                }

                // if name is segment-build-list-slope-direction and value is Horizontal and
                // closest slope is bigger than 0 set to empty
                if ($(target).attr("name") == "segment-build-list-slope-direction" && $(target).val() == "Horizontal" && parseInt($(target).closest("tr").find("[name='segment-build-list-slope']").val()) > 0) {
                    $(target)
                        .closest("tr")
                        .find("[name='segment-build-list-slope']")
                        .val("");
                }

                // if name is slope and value is bigger than 0 and closest slope-direction is
                // equal to Horizontal set to empty
                if ($(target).attr("name") == "segment-build-list-slope" && parseInt($(target).val()) > 0 && $(target).closest("tr").find("[name='segment-build-list-slope-direction']").val() == "Horizontal") {
                    //remove Horizontal option
                    $(target)
                        .closest("tr")
                        .find("[name='segment-build-list-slope-direction'] option[value='Horizontal']")
                        .remove();
                    $(target)
                        .closest("tr")
                        .find("[name='segment-build-list-slope-direction']")
                        .val("")
                        .addClass("redBackground");
                } else {
                    //add Horizontal option if not exists
                    if ($(target).closest("tr").find("[name='segment-build-list-slope-direction'] option[value='Horizontal']").length == 0) {
                        $(target)
                            .closest("tr")
                            .find("[name='segment-build-list-slope-direction']")
                            .append("<option value='Horizontal'>Horizontal</option>");
                    }
                }

            }
        },
        printPDF() {
            $.toast({
                heading: "Information",
                text: "Generating PDF...",
                icon: "info",
                hideAfter: false,
                stack: false,
                position: "bottom-left"
            });

            var tmp = jQuery("body").clone();
            var logo = pullCalculator.mainUrl + "/wp-content/themes/champion/powercable-par" +
                    "ts/images/Champion-Fiberglass-Flag-Logo.png";
            jQuery(document.createElement("img"))
                .attr({src: logo, id: "logoPrint"})
                .insertBefore(tmp.find("#powerCalculatorContainer"));
            tmp
                .find("header")
                .remove();
            tmp
                .find("#wpadminbar")
                .remove();
            tmp
                .find("#footer")
                .remove();
            tmp
                .find("#toPDF")
                .remove();
            tmp
                .find("#page-container")
                .remove();
            tmp
                .find(".jq-toast-wrap")
                .remove();
            tmp
                .find(".actionButton")
                .remove();
            tmp
                .find(".space")
                .css({"margin-top": "300px", float: "left", width: "100%"});
            tmp
                .find("#powerCalculatorContainer")
                .addClass("printOnly")
                .css("margin-top", "-300px");

            tmp
                .find("input, select, textarea")
                .each(function (index, element) {
                    if (jQuery(element).attr("type") != "hidden" && !jQuery(element).hasClass("noDisplay")) {
                        var _class = "";
                        if (jQuery(element).hasClass("userFill")) {
                            _class = " userFill";
                        }
                        var tmp = jQuery(element).attr("id");
                        if (jQuery(element).get(0).tagName == "SELECT") {
                            var _value = jQuery("#" + tmp + " option:selected").text();
                        } else {
                            var _value = jQuery("#" + tmp).val();
                        }

                        jQuery(element).replaceWith(
                            "<label class='" + _class + " labelPrint'>" + _value + "</label>"
                        );
                    }
                });
            setTimeout(() => {
                //$("body").replaceWith(tmp);
                var printContents = $("<div />")
                    .append(tmp)
                    .html();
                var opt = {
                    margin: 2,
                    image: {
                        type: "jpeg",
                        quality: 1
                    },
                    html2canvas: {
                        dpi: 300,
                        letterRendering: true,
                        scale: 1,
                        height: 2500
                    },
                    jsPDF: {
                        unit: "mm",
                        format: "a3",
                        orientation: "landscape"
                    },
                    pagebreak: {
                        mode: ["legacy"]
                    }
                };
                // Choose the element and save the PDF for our user.
                html2pdf()
                    .from(printContents)
                    .set(opt)
                    .save("power-cable-calculator.pdf");
                $.toast({
                    heading: "Calculating",
                    text: "Successfully generated PDF",
                    icon: "sucess",
                    hideAfter: 3000,
                    stack: false,
                    position: "bottom-left"
                });
            }, 200);
        },
        validations: function () {
            /* Validations */
            $(
                "#segmentBuildListSection .redBackground, #segmentBuildListSection .greenBackgr" +
                "ound, #segmentBuildListSection .pinkBackground, #segmentBuildListSection .purp" +
                "leBackground"
            ).removeClass("redBackground greenBackground pinkBackground purpleBackground");
            // $("[name='segment-build-list-tension'],
            // [name='segment-build-list-SWBP']").removeClass("override")
            var items = $(".segments-item tr").length;

            for (let i = 1; i < items + 1; i++) {

                // IF segment-build-list-slope is bigger than 0 and
                // segment-build-list-slope-direction is equal to Horizontal
                if (parseInt($(
                    ".segments-item .seg_" + i + " [name='segment-build-list-slope']"
                ).val()) > 0 && $(
                    ".segments-item .seg_" + i + " [name='segment-build-list-slope-direction']"
                ).val() == "Horizontal") {
                    $(
                        ".segments-item .seg_" + i + " [name='segment-build-list-slope-direction']"
                    ).addClass("redBackground");
                }

                //If direction is Down and slope is bigger than 0 and length is equal to 0
                if ($(
                    ".segments-item .seg_" + i + " [name='segment-build-list-slope-direction']"
                ).val() == "Down" && parseInt($(
                    ".segments-item .seg_" + i + " [name='segment-build-list-slope']"
                ).val()) > 0 && parseInt($(
                    ".segments-item .seg_" + i + " [name='segment-build-list-length']"
                ).val()) == 0) {
                    $(
                        ".segments-item .seg_" + i + " [name='segment-build-list-length']"
                    ).addClass("redBackground");
                }

                // If segment-build-list-elbow-radius is different than 0 and
                // segment-build-list-elbow-angle is empty
                if (parseInt($(
                    ".segments-item .seg_" + i + " [name='segment-build-list-elbow-radius']"
                ).val()) > 0 && parseInt($(
                    ".segments-item .seg_" + i + " [name='segment-build-list-elbow-angle']"
                ).val()) == 0) {
                    $(
                        ".segments-item .seg_" + i + " [name='segment-build-list-elbow-angle']"
                    ).addClass("greenBackground");
                }

                // If segment-build-list-elbow-radius is different than 0 and
                // segment-build-list-elbow-angle is empty
                if (parseInt($(
                    ".segments-item .seg_" + i + " [name='segment-build-list-elbow-angle']"
                ).val()) > 0 && parseInt($(
                    ".segments-item .seg_" + i + " [name='segment-build-list-elbow-radius']"
                ).val()) == 0) {
                    $(
                        ".segments-item .seg_" + i + " [name='segment-build-list-elbow-radius']"
                    ).addClass("greenBackground");
                }

                // If segment-build-list-tension is bigger than
                // pullCalculator.maximumPullingLimit

                if (parseInt($(
                    ".segments-item .seg_" + i + " [name='segment-build-list-tension']"
                ).val()) > pullCalculator.maximumPullingLimit) {
                    $(
                        ".segments-item .seg_" + i + " [name='segment-build-list-tension']"
                    ).addClass("purpleBackground");
                } else {
                    $(
                        ".segments-item .seg_" + i + " [name='segment-build-list-tension']"
                    ).removeClass("purpleBackground");
                }

                // If segment-build-list-SWBP is bigger than
                // pullCalculator.minmaximumPullingLimit
                if (parseInt($("#segment-build-list-SWBP_" + i).val()) > pullCalculator.minmaximumPullingLimit) {
                    $(
                        ".segments-item .seg_" + i + " [name='segment-build-list-SWBP']"
                    ).addClass("pinkBackground ");
                } else {
                    $(
                        ".segments-item .seg_" + i + " [name='segment-build-list-SWBP']"
                    ).removeClass("pinkBackground");
                }

                // The box should appear red in the Slope degree field if the adjacent Slope
                // Direction is up or down and there is no Slope Degree entered.
                if (($(
                    ".segments-item .seg_" + i + " [name='segment-build-list-slope-direction']"
                ).val() == "Up" || $(
                    ".segments-item .seg_" + i + " [name='segment-build-list-slope-direction']"
                ).val() == "Down") && (parseInt($(
                    ".segments-item .seg_" + i + " [name='segment-build-list-slope']"
                ).val()) == 0 || $(
                    ".segments-item .seg_" + i + " [name='segment-build-list-slope']"
                ).val() == "")) {
                    $(
                        ".segments-item .seg_" + i + " [name='segment-build-list-slope']"
                    ).addClass("redBackground");
                } else {
                    $(
                        ".segments-item .seg_" + i + " [name='segment-build-list-slope']"
                    ).removeClass("redBackground");
                }
            }
        },
        saveData: function () {
            //Get Data

            var data = {
                projectInformation: {
                    profileDate: $("#profileDate").val(),
                    projectName: $("#projectName").val(),
                    contractor: $("#contractor").val(),
                    calculatedBy: $("#calculatedBy").val(),
                    notes: $("#notes").val()
                },
                projectInputs: {
                    raceway: $("#raceway").val(),
                    tradeSize: $("#tradeSize").val(),
                    conduitType: $("#conduitType").val(),
                    "incoming-tension": $("#incoming-tension").val(),
                    "grip-type": $("#grip-type").val(),
                    lubricant: $("#lubricant").val(),
                    minimumTrade: $("#minimumTrade").text()
                },
                cableInformation: {
                    weightCorrection: $("#weightCorrection").text(),
                    "information-phase": $("#information-phase").val(),
                    "information-ground": $("#information-ground").val(),
                    totalCables: $("#totalCables").text(),
                    totalWeight: $("#totalWeight").text(),
                    pullConfiguration: $("#pullConfiguration").text(),
                    cableImage: $("#cableImage").attr("src")
                },
                overrides: {
                    "override-coefficient-friction": $("#override-coefficient-friction").val(),
                    "override-pull-configuration": $("#override-pull-configuration").val(),
                    "override-maximum-pulling-limit": $("#override-maximum-pulling-limit").val(),
                    "override-maximum-SWBP-limit": $("#override-maximum-SWBP-limit").val()
                },
                segments: pullCalculator.getSegments(false, "object", true)
            };

            let types = ["phase", "ground", "neutral"];
            $.each(types, function (i, v) {
                data.cableInformation["information-" + v + "-cables"] = $(
                    "#information-" + v + "-cables"
                ).val();
                data.cableInformation["information-" + v + "-cu_al"] = $(
                    "#information-" + v + "-cu_al"
                ).val();
                data.cableInformation["information-" + v + "-type"] = $(
                    "#information-" + v + "-type"
                ).val();
                data.cableInformation["information-" + v + "-size"] = $(
                    "#information-" + v + "-size"
                ).val();
                data.cableInformation["information-" + v + "-ccCount"] = $(
                    "#information-" + v + "-ccCount"
                ).val();
                data.cableInformation["information-" + v + "-voltage"] = $(
                    "#information-" + v + "-voltage"
                ).val();
                data.cableInformation["information-" + v + "-v_kv"] = $(
                    "#information-" + v + "-v_kv"
                ).val();
                data.cableInformation["information-" + v + "-armor"] = $(
                    "#information-" + v + "-armor"
                ).val();
                data.cableInformation["information-" + v + "-jacket"] = $(
                    "#information-" + v + "-jacket"
                ).val();
                data.cableInformation["information-" + v + "-OD"] = $(
                    "#information-" + v + "-OD"
                ).val();
                data.cableInformation["information-" + v + "-Lbsft"] = $(
                    "#information-" + v + "-Lbsft"
                ).val();
            });

            if (pullCalculator._ajaxpowercablesaveData != null) {
                pullCalculator
                    ._ajaxpowercablesaveData
                    .abort();
            }

            $.ajax({
                type: "POST",
                async: pullCalculator.ajaxAsync,
                url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                data: {
                    action: "powercablesaveData",
                    data: data,
                    id: pullCalculator.loadDataId
                },
                dataType: "json",
                beforeSend: function () {
                    $.toast({
                        heading: false,
                        text: "Generating the link",
                        showHideTransition: "slide",
                        icon: "info",
                        stack: false,
                        hideAfter: false,
                        position: "bottom-left"
                    });
                },
                success: function (response) {
                    if (response.status) {
                        pullCalculator.copyTheLink(response.id);
                    }
                }
            });
        },
        clearAll: function () {
            $("#powerCalculatorContainer .formField").each(function (index, element) {
                if ($(element).is("select")) {
                    $(element).val($(element).find("option:first").val());
                } else if ($(element).is("td")) {
                    $(element).html("");
                } else {
                    $(element).val("");
                }
            });

            $(document.createElement("option"))
                .attr({value: ""})
                .html("Select an Option")
                .prependTo($("#conduitType"));
            $("#conduitType").val("");

            $(document.createElement("option"))
                .attr({value: ""})
                .html("Select an Option")
                .prependTo($("#tradeSize"));
            $("#tradeSize").val("");

            $("#segmentBuildList").trigger("reset");
            $("#segmentBuildList td label")
                .removeClass("redText")
                .text("");
            $("#segmentBuildList td input")
                .removeClass("redText")
                .val("");
            $("[name='segment-build-list-tension'], [name='segment-build-list-SWBP']").removeClass(
                "override"
            );

            $("#overrides").trigger("reset");
            pullCalculator.coefficient_of_friction = "";
            $("#pull-profile-coefficient-friction")
                .parent()
                .removeClass("redText");
            $(".purpleBackground").removeClass("purpleBackground");

            $(
                "#comparison-install-hours, #comparison-install-hours-extra, #comparison-instal" +
                "l-hours-extra-compare, #comparison-maximum-support, #comparison-maximum-suppor" +
                "t-extra, #comparison-coefficient-friction, #comparison-pull-configuration, #co" +
                "mparison-maximum-pulling-limit, #comparison-total-conduit-weight, #comparison-" +
                "cable-fault, #comparison-estimated-numbers-support"
            ).text("");

            setTimeout(() => {
                /* All required fields in red */
                $(".userFill.required").addClass("error");
            }, 200);
        },
        copyTheLink: function (id) {
            //copy text to clipboard
            navigator
                .clipboard
                .writeText(location.origin + location.pathname + "?id=" + id);

            $.toast({
                heading: false,
                text: "Link copied to clipboard",
                showHideTransition: "slide",
                icon: "success",
                stack: false,
                hideAfter: 3000,
                position: "bottom-left"
            });
        },
        loadData: function (id) {
            //console.clear();
            $(
                "#powerCalculatorContainer input:not(.userFill), #powerCalculatorContainer sele" +
                "ct:not(.userFill)"
            ).removeAttr("disabled");
            $.toast({
                heading: "Loading",
                text: "Loading data",
                showHideTransition: "slide",
                icon: "info",
                stack: true,
                hideAfter: false,
                position: "bottom-left"
            });

            $.ajax({
                type: "POST",
                url: pullCalculator.mainUrl + "wp-admin/admin-ajax.php?",
                data: {
                    action: "powercableloadData",
                    id: id
                },
                dataType: "json",
                success: function (response) {
                    if (response.status) {
                        var cont = 1;
                        $.each(response.data, function (section_index, section) {
                            $.each(section, function (i, v) {
                                if (section_index != "segments") {
                                    if (i == "profileDate") {
                                        $("#" + i).datepicker("setDate", v);
                                    } else {
                                        $("#" + i + ":visible").val(v);
                                    }
                                } else {
                                    $.each(v, function (segment_index, segment) {
                                        $(".seg_" + cont + " [name='" + segment_index + "']").val(segment);
                                        $(
                                            ".seg_" + cont + " [name='" + segment_index + "'] + .select2 .select2-selection" +
                                            "__rendered"
                                        )
                                            .text(segment)
                                            .attr("title", segment);

                                    });
                                    cont++;
                                }
                            });
                        });

                        $("#override-coefficient-friction").trigger("change");

                        setTimeout(() => {
                            pullCalculator
                                .racewayChange(false)
                                .done(function () {
                                    pullCalculator
                                        .conduitTypeChange()
                                        .done(function () {
                                            $("#tradeSize").val(response.data["projectInputs"]["tradeSize"]);
                                            pullCalculator
                                                .getPullConfiguration()
                                                .done(function () {
                                                    pullCalculator.calculateSegments();

                                                    //remove error class to all the .required files if has value
                                                    $(".userFill.required").each(function (index, element) {
                                                        if ($(element).val() != "") {
                                                            $(element).removeClass("error");
                                                        }
                                                    });
                                                });
                                        });
                                });
                        }, 300);
                    }
                }
            });
        }
    };

    pullCalculator.init();
});
