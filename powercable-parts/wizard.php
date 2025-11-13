<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<?php if (!empty($include_assets)): ?>
<link rel="stylesheet" href="<?= esc_url($assets_url) ?>css/jquery-ui.css">
<link rel="stylesheet" href="<?= esc_url($assets_url) ?>css/jquery.steps.css">
<link rel="stylesheet" href="<?= esc_url($assets_url) ?>css/power_cable_calc.css">
<link rel="stylesheet" href="<?= esc_url($assets_url) ?>css/jquery.toast.min.css" />
<!-- load bootstrap -->
<link rel="stylesheet" href="<?= esc_url($assets_url) ?>css/bootstrap.min.css" />
<!-- Select2 CSS -->
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

<script src="<?= esc_url($assets_url) ?>js/jquery-3.6.0.min.js"></script>
<script src="<?= esc_url($assets_url) ?>js/popper.min.js"></script>
<script src="<?= esc_url($assets_url) ?>js/bootstrap.min.js"></script>
<script src="<?= esc_url($assets_url) ?>js/jquery-ui.js"></script>
<script src="<?= esc_url($assets_url) ?>js/jquery.validate.js"></script>
<script src="https://kit.fontawesome.com/6d229b0667.js" crossorigin="anonymous"></script>
<script src="<?= esc_url($assets_url) ?>js/jquery.steps.min.js"></script>
<!-- Select2 JS -->
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script src="<?= esc_url($assets_url) ?>js/power_cable_calc.js"></script>
<script type="text/javascript" src="<?= esc_url($assets_url) ?>js/jspdf.min.js"></script>
<script type="text/javascript" src="<?= esc_url($assets_url) ?>js/html2canvas.js"></script>
<script src="<?= esc_url($assets_url) ?>js/jquery.toast.min.js"></script>

<script src="<?= esc_url($assets_url) ?>js/html2pdf.bundle.min.js"></script>
<?php endif; ?>


<input id="_nonce" type="hidden" value="<?= esc_attr(wp_create_nonce('pullCalculator')) ?>">
<input id="_mode" type="hidden" value="<?= esc_attr($a["mode"]) ?>">
<input id="mainUrl" type="hidden" value="<?= esc_url(get_site_url()) ?>">
<input id="themeUrl" type="hidden" value="<?= esc_url($plugin_url) ?>">
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