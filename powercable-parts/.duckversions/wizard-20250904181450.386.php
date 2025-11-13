<link rel="stylesheet" href="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/css/jquery-ui.css">
<link rel="stylesheet" href="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/css/jquery.steps.css">
<link rel="stylesheet" href="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/css/power_cable_calc.css">
<link rel="stylesheet" href="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/css/jquery.toast.min.css" />
<!-- <link href="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/css/select2.min.css" rel="stylesheet" /> -->

<script src="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/js/jquery-3.6.0.min.js"></script>
<script src="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/js/popper.min.js"></script>
<script src="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/js/bootstrap.min.js"></script>
<script src="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/js/jquery-ui.js"></script>
<script src="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/js/jquery.validate.js"></script>
<script src="https://kit.fontawesome.com/6d229b0667.js" crossorigin="anonymous"></script>
<script src="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/js/jquery.steps.min.js"></script>
<script src="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/js/power_cable_calc.js"></script>
<script type="text/javascript" src="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/js/jspdf.min.js"></script>
<script type="text/javascript" src="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/js/html2canvas.js"></script>
<script src="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/js/jquery.toast.min.js"></script>

<script src="<?= trailingslashit(get_stylesheet_directory_uri()) ?>/assets/js/html2pdf.bundle.min.js"></script>


<input id="_nonce" type="hidden" value="<?= wp_create_nonce('pullCalculator') ?>">
<input id="_mode" type="hidden" value="<?= $a["mode"] ?>">
<input id="mainUrl" type="hidden" value="<?= get_site_url(); ?>">
<input id="themeUrl" type="hidden" value="<?= trailingslashit(get_stylesheet_directory_uri()) ?>">
<div id="powerCalculatorContainer" class="<?= $a["mode"] ?>">
    <div class="globalActions projectInformation col-xs-12">
        <button class="btn btn-primary actionButton" id="toPDF">Save PDF</button>
        <button class="btn btn-primary actionButton" id="toSave">Share</button>
        <button class="btn btn-primary actionButton" id="toClearAll">Clear Sheet</button>
        <button class="btn btn-primary actionButton" id="toCalculate">Calculate</button>
    </div>
    <?php

    require(__DIR__ . '/project-information.php');
    require(__DIR__ . '/project-inputs.php');
    require(__DIR__ . '/cable-information.php');
    echo "<hr>";
    require(__DIR__ . '/pull-profile-summary.php');
    require(__DIR__ . '/comparison-conduit-types.php');
    echo "<div class='space'></div>";
    require(__DIR__ . '/segment-build-list.php');
    require(__DIR__ . '/project-overrides.php');


    ?>

    <div class="loadingOverlay"><span class="loaderIcon"></span></div>
    <!-- <div class="col-md-12">
        <button id="calculate" class="btn btn-primary " disabled>Calculate</button>
    </div> -->
</div>


<!-- <div id="testButtonsContainer" class="col-md-12">
    <button id="type108" class="btn btn-primary testData" >Test 108</button>
    <button id="type109" class="btn btn-primary testData" >Test 109</button>
</div> -->