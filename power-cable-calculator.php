<?php
/**
 * Plugin Name: Champion Power Cable Calculator
 * Description: Provides the Champion Fiberglass power cable calculator via shortcode.
 * Version: 1.0.0
 * Author: Champion Fiberglass
 */

if (!defined('ABSPATH')) {
    exit;
}

class champion_power_cable
{

    /**
     * WordPress table prefix.
     *
     * @var string
     */
    private $table_prefix;

    /**
     * Absolute plugin path.
     *
     * @var string
     */
    private $plugin_path;

    /**
     * Public plugin URL.
     *
     * @var string
     */
    private $plugin_url;

    /**
     * Base URL for plugin assets.
     *
     * @var string
     */
    private $assets_url;

    /**
     * Track whether assets have been enqueued for the shortcode.
     *
     * @var bool
     */
    private $assets_enqueued = false;

    /**
     * Build a fully prefixed database table name.
     *
     * @param string $suffix
     * @return string
     */
    private function table($suffix)
    {
        return $this->table_prefix . $suffix;
    }

    /**
     * Replace the default wp_ prefix in raw SQL strings with the site's configured prefix.
     *
     * @param string $sql
     * @return string
     */
    private function prefix_sql($sql)
    {
        return str_replace('wp_', $this->table_prefix, $sql);
    }

    /**
     * Helper wrapper for $wpdb->get_results with automatic table prefix replacement.
     *
     * @param string $sql
     * @param string $output
     * @return array|object|null
     */
    private function db_get_results($sql, $output = ARRAY_A)
    {
        global $wpdb;
        return $wpdb->get_results($this->prefix_sql($sql), $output);
    }

    /**
     * Helper wrapper for $wpdb->get_row with automatic table prefix replacement.
     *
     * @param string $sql
     * @param string $output
     * @return array|object|null
     */
    private function db_get_row($sql, $output = ARRAY_A)
    {
        global $wpdb;
        return $wpdb->get_row($this->prefix_sql($sql), $output);
    }

    /**
     * Helper wrapper for $wpdb->query with automatic table prefix replacement.
     *
     * @param string $sql
     * @return int|false
     */
    private function db_query($sql)
    {
        global $wpdb;
        return $wpdb->query($this->prefix_sql($sql));
    }

    public $ORIGINALIPSMIN = null;
    public $COMPARISONCHARTS = null;

    public function __construct()
    {
        global $wpdb;

        $this->table_prefix = $wpdb->prefix;
        $this->plugin_path = plugin_dir_path(__FILE__);
        $this->plugin_url = plugin_dir_url(__FILE__);
        $this->assets_url = trailingslashit($this->plugin_url . 'assets');

        /* Pull Calculator ajax */
        add_shortcode('power_cable_calc', [$this, 'power_cable_calc']);


        $actions = array(
            "getSizes",
            "getPipeTypes",
            "getCableInputSizes",
            "min_nec_fill",
            "inside_diameter_conduit",
            "getWeightCorrection",
            "calculateSegments",
            "getConduitID",
            "wireProfile",
            "printPDF",
            "createPoweCableTables",
            "powercablesaveData",
            "powercableloadData",
            "createTables",
            "get_OD_LBS",
            "checkFields",
        );


        foreach ($actions as $k => $v) {
            add_action('wp_ajax_' . $v, [$this, $v]);
            add_action('wp_ajax_nopriv_' . $v, [$this, $v]);
        }


        $this->ORIGINALIPSMIN = array(
            ["0", "0"],
            ["3/4", "07"],
            ["1", "10"],
            ["1-1/4", "12"],
            ["1-1/2", "15"],
            ["2", "20"],
            ["2-1/2", "25"],
            ["3", "30"],
            ["3-1/2", "35"],
            ["4", "40"],
            ["5", "50"],
            ["6", "60"],
            ["8", "80"],
        );

        $this->COMPARISONCHARTS = array(
            "Cable Fault",
            "Not Affected",
            "Not Affected",
            "Melt / Fuse",
            "Melt / Fuse",
            "Weld",
            "Weld",
            "Weld"
        );
    }

    public function checkFields()
    {
        global $wpdb;
        $sql = "SELECT * FROM wp_pull_diameter ";
        $wireResults = $this->db_get_results($sql, ARRAY_A);

        echo '<pre>';
        print_r($wireResults);
        echo '</pre>';
        die();
    }

    public function get_OD_LBS()
    {

        try {

            if (!wp_verify_nonce($_POST['nonce'], 'pullCalculator')) {
                throw new Exception("Invalid Request.");
            }

            /* Get Conduit Types */
            global $wpdb;
            $sql = "SELECT * FROM wp_pull_wire_profiles where TYPE = '" . $_POST['type'] . "' AND Conductor_size = '" . $_POST['size'] . "' limit 1";
            $wireResults = $this->db_get_results($sql, ARRAY_A);

            if (empty($wireResults)) {
                throw new Exception("No Wire types found.");
            }

            echo json_encode(["status" => true, "data" => $wireResults]);
        } catch (\Throwable $th) {
            echo json_encode(["status" => false, "msg" => $th->getMessage()]);
        }

        die();
    }

    public function createTables()
    {

        $sql = file_get_contents(dirname(__FILE__) . "/powercable-parts/clean.sql");
        $sql = $this->prefix_sql($sql);

        $dropTables = "DROP TABLE IF EXISTS `wp_pull_bend_section_direction`;
        DROP TABLE IF EXISTS `wp_pull_cable_armor`;
        DROP TABLE IF EXISTS `wp_pull_conduit_diameters`;
        DROP TABLE IF EXISTS `wp_pull_diameter`;
        DROP TABLE IF EXISTS `wp_pull_pipe_types`;
        DROP TABLE IF EXISTS `wp_pull_project_cable_input`;
        DROP TABLE IF EXISTS `wp_pull_raceway_types`;
        DROP TABLE IF EXISTS `wp_pull_trade_sizes`;
        DROP TABLE IF EXISTS `wp_pull_weight_correction_factor_table`;
        DROP TABLE IF EXISTS `wp_pull_jacket_material`;
        DROP TABLE IF EXISTS `wp_pull_coefficient_of_friction`;
        DROP TABLE IF EXISTS `wp_pull_wire_profiles`;
        DROP TABLE IF EXISTS `wp_pull_bend_section_direction`; 
        DROP TABLE IF EXISTS `wp_pull_neca_manual_labour_hours`; 
        DROP TABLE IF EXISTS `wp_pull_elbow_manual_labour_hours`;";
        foreach (explode(";", $dropTables) as $value) {
            $value = trim($value);
            if (empty($value)) {
                continue;
            }
            $this->db_query($value);
        }

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        $alter = "
            ALTER TABLE `wp_pull_bend_section_direction`
            ADD PRIMARY KEY (`ID`);
            ALTER TABLE `wp_pull_cable_armor`
            ADD PRIMARY KEY (`id`);
            ALTER TABLE `wp_pull_conduit_diameters`
            ADD PRIMARY KEY (`Diameter_ID`);
            ALTER TABLE `wp_pull_diameter`
            ADD PRIMARY KEY (`Diameter_Number`);
            ALTER TABLE `wp_pull_jacket_material`
            ADD PRIMARY KEY (`id`);
            ALTER TABLE `wp_pull_pipe_types`
            ADD PRIMARY KEY (`id`);
            ALTER TABLE `wp_pull_project_cable_input`
            ADD PRIMARY KEY (`id`);
            ALTER TABLE `wp_pull_raceway_types`
            ADD PRIMARY KEY (`id`);
            ALTER TABLE `wp_pull_trade_sizes`
            ADD PRIMARY KEY (`id`);
            ALTER TABLE `wp_pull_cable_armor`
            MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
            ALTER TABLE `wp_pull_jacket_material`
            MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
            ALTER TABLE `wp_pull_pipe_types`
            MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
            ALTER TABLE `wp_pull_project_cable_input`
            MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
            ALTER TABLE `wp_pull_raceway_types`
            MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
            ALTER TABLE `wp_pull_trade_sizes`
            MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
            ALTER TABLE `wp_pull_coefficient_of_friction`
            ADD PRIMARY KEY
            (`id`);
            ALTER TABLE `wp_pull_wire_profiles`
            ADD PRIMARY KEY (`ID`);
            ALTER TABLE `wp_pull_maximun_support_distances`
            ADD PRIMARY KEY (`Cunduit`);
            ALTER TABLE `wp_pull_neca_manual_labour_hours`
            ADD PRIMARY KEY (`Cunduit`);
            ALTER TABLE `wp_pull_elbow_manual_labour_hours`
            ADD PRIMARY KEY (`Elbow`);
            COMMIT;";
        foreach (explode(";", $alter) as $value) {
            $value = trim($value);
            if (empty($value)) {
                continue;
            }
            $this->db_query($value);
        }

        if (wp_doing_ajax()) {
            echo "Done";
            wp_die();
        }

        return true;
    }


    public function createPoweCableTables()
    {

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        $dropTables = $this->prefix_sql("DROP TABLE IF EXISTS wp_pull_power_cable;");
        $this->db_query($dropTables);

        $table = $this->prefix_sql('CREATE TABLE wp_pull_power_cable (id int NOT NULL, random varchar(100) NOT NULL, data text NOT NULL, timestamp timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP );');

        dbDelta($table);

        $alter = $this->prefix_sql("ALTER TABLE wp_pull_power_cable ADD PRIMARY KEY (`id`);ALTER TABLE wp_pull_power_cable MODIFY `id` int NOT NULL AUTO_INCREMENT;");
        foreach (explode(";", $alter) as $value) {
            $value = trim($value);
            if (empty($value)) {
                continue;
            }
            $this->db_query($value);
        }

        if (wp_doing_ajax()) {
            echo "Done";
            wp_die();
        }

        return true;
    }

    /**
     * Plugin activation hook.
     *
     * @return void
     */
    public function activate_plugin()
    {
        $this->createTables();
        $this->createPoweCableTables();
    }

    public function power_cable_calc($atts)
    {

        ob_start();

        global $wpdb;
        $a = shortcode_atts(
            array(
                "mode" => "regular",
            ),
            $atts
        );

        /* Get Reaceway Types */
        $racewayTypes = $this->db_get_results("Select * from wp_pull_raceway_types", ARRAY_A);

        /* Get Conduit Types */
        $conduitTypes = json_decode($this->db_get_results("Select types from wp_pull_pipe_types WHERE name = 'PTCH'", ARRAY_A)[0]["types"]);

        /* Get Sizes */
        $tradeName = substr($conduitTypes[0], 0, 2) . "TRA" . $racewayTypes[0]["id"];
        $sizes = json_decode($this->db_get_results("Select sizes from wp_pull_trade_sizes WHERE name = '" . $tradeName . "'", ARRAY_A)[0]["sizes"]);

        /* Cable input Type and Sizes */
        $cableInputType = $this->db_get_results("Select id,name from wp_pull_project_cable_input", ARRAY_A);
        $cableInputSizes = json_decode($this->db_get_results("Select sizes from wp_pull_project_cable_input where name = 'XHH'", ARRAY_A)[0]["sizes"]);

        /* Material Armor */
        $materialArmor = $this->db_get_results("Select material from wp_pull_cable_armor", ARRAY_A);

        /* Jacket */
        $jacketMaterial = $this->db_get_results("Select material from wp_pull_jacket_material", ARRAY_A);

        $assets_url = trailingslashit($this->assets_url);
        $plugin_url = trailingslashit($this->plugin_url);
        $include_assets = !$this->assets_enqueued;

        include_once($this->plugin_path . "powercable-parts/wizard.php");

        $this->assets_enqueued = true;


        return ob_get_clean();
    }

    public function getPipeTypes($type)
    {

        try {

            if (!wp_verify_nonce($_POST['nonce'], 'pullCalculator')) {
                throw new Exception("Invalid Request.");
            }

            /* Get Conduit Types */
            global $wpdb;
            $conduitTypes = json_decode($this->db_get_results("Select types from wp_pull_pipe_types WHERE name = '" . $_POST["type"] . "'", ARRAY_A)[0]["types"]);

            if (empty($conduitTypes)) {
                throw new Exception("No pipe types found.");
            }

            echo json_encode(["status" => true, "data" => $conduitTypes]);
        } catch (\Throwable $th) {
            echo json_encode(["status" => false, "msg" => $th->getMessage()]);
        }

        die();
    }

    public function getSizes($type)
    {
        try {

            if (!wp_verify_nonce($_POST['nonce'], 'pullCalculator')) {
                throw new Exception("Invalid Request.");
            }

            /* Get Sizes */
            global $wpdb;
            $tradeName = substr($_POST["conduitType"], 0, 2) . "TRA" . $_POST["raceway"];
            $sizes = json_decode($this->db_get_results("Select sizes from wp_pull_trade_sizes WHERE name = '" . $tradeName . "'", ARRAY_A)[0]["sizes"]);

            if (empty($sizes)) {
                throw new Exception("No Sizes found.");
            }

            echo json_encode(["status" => true, "data" => $sizes]);
        } catch (\Throwable $th) {
            echo json_encode(["status" => false, "msg" => $th->getMessage()]);
        }

        die();
    }

    public function getCableInputSizes()
    {
        try {

            if (!wp_verify_nonce($_POST['nonce'], 'pullCalculator')) {
                throw new Exception("Invalid Request.");
            }

            /* Get Sizes */
            global $wpdb;

            $cableInputType = $_POST['information-type'];
            if ($_POST['mode'] == "regular") {
                $cableInputType = "XHH";
            }

            $sizes = json_decode($this->db_get_results("Select sizes from wp_pull_project_cable_input WHERE name = '" . $cableInputType . "'", ARRAY_A)[0]["sizes"]);

            if (empty($sizes)) {
                throw new Exception("No Sizes found.");
            }

            echo json_encode(["status" => true, "data" => $sizes]);
        } catch (\Throwable $th) {
            echo json_encode(["status" => false, "msg" => $th->getMessage()]);
        }

        die();
    }

    public function min_nec_fill()
    {
        try {
            if (!wp_verify_nonce($_POST['nonce'], 'pullCalculator')) {
                throw new Exception("Invalid Request.");
            }


            global $wpdb;
            $diameter = $this->db_get_results("Select * from wp_pull_diameter where Description = '" . $_POST["trade_size"] . "\"'", ARRAY_A)[0]["Diameter_Number"];


            if (empty($diameter)) {
                $field = $_POST["cables"] . "_cable";
                if ($_POST["cables"] > 2) {
                    $field = "3_cable";
                }
                $diameter = $this->db_get_results("Select * from wp_pull_diameter where " . $field . " < '" . ($_POST["total_cable"] + 1) . "\"' and type = '" . $_POST["mode"] . "' order by " . $field . " DESC limit 1", ARRAY_A)[0]["Diameter_Number"];
            }

            $base = $_POST["pipetype"] . $_POST["raceway"] . "TRA" . $diameter;


            $IPSMIN = null;
            /*  switch ($_POST['mode']) {
            default: */

            $index = 0;
            foreach ($this->ORIGINALIPSMIN as $k => $v) {
                if ($k == 0) {
                    continue;
                }
                $IPSMIN[$index]["description"] = $_POST["pipetype"] . $_POST["raceway"] . "TRA" . $v[1];

                // Convert fraction format to decimal (e.g., "3/4" -> 0.75, "1-1/2" -> 1.5)
                $sizeStr = $v[0];
                if (strpos($sizeStr, '-') !== false) {
                    // Handle formats like "1-1/2", "2-1/4"
                    $parts = explode('-', $sizeStr);
                    $whole = (float)$parts[0];
                    $fraction = $parts[1];
                    if (strpos($fraction, '/') !== false) {
                        $fracParts = explode('/', $fraction);
                        $decimal = $whole + ((float)$fracParts[0] / (float)$fracParts[1]);
                    } else {
                        $decimal = $whole;
                    }
                } elseif (strpos($sizeStr, '/') !== false) {
                    // Handle simple fractions like "3/4", "1/2"
                    $fracParts = explode('/', $sizeStr);
                    $decimal = (float)$fracParts[0] / (float)$fracParts[1];
                } else {
                    // Simple number like "1", "2"
                    $decimal = (float)$sizeStr;
                }
                $IPSMIN[$index]["code"] = number_format($decimal, 2);
                $IPSMIN[$index]["original"] = $v[0];

                $diameters = $this->db_get_results("Select * from wp_pull_conduit_diameters where Diameter_ID = '" . $IPSMIN[$index]["description"] . "'", ARRAY_A)[0];
                if (!empty($diameters)) {
                    $IPSMIN[$index]["ID"] = $diameters["ID"];

                    // (PI()*(($BJ7/2)^2))*BK$5)
                    $IPSMIN[$index]["1"] = (M_PI * (pow((float) $IPSMIN[$index]["ID"] / 2, 2))) * 0.53;

                    // (PI()*(($BJ7/2)^2))*BL$5)
                    $IPSMIN[$index]["2"] = (M_PI * (pow((float) $IPSMIN[$index]["ID"] / 2, 2))) * 0.31;

                    // (PI()*(($BJ7/2)^2))*BL$5)
                    $IPSMIN[$index][">2"] = (M_PI * (pow((float) $IPSMIN[$index]["ID"] / 2, 2))) * 0.40;
                }
                $index++;
            }

            $finalIPSMIN = 0;
            $IPSMIndex = "0";
            $type = 0;

            // Fixed: Match Excel MATCH/INDEX +1 logic exactly
            // Excel logic: MATCH(cable_area, conduit_areas, 1) finds LARGEST conduit_area <= cable_area
            //              INDEX(trade_sizes, MATCH_position + 1) returns NEXT trade size
            // This means: Find the conduit that's TOO SMALL, then return the next size up

            $matchedPosition = -1;
            $cableArea = (float)$_POST["total_cable"];
            $cableCount = (int)$_POST["cables"];

            // Determine which fill column to use based on cable count
            $fillColumn = ">2"; // Default to 40% fill for 3+ cables
            if ($cableCount == 1) {
                $fillColumn = "1"; // 53% fill
                $type = 1;
            } elseif ($cableCount == 2) {
                $fillColumn = "2"; // 31% fill
                $type = 2;
            } else {
                $type = 3;
            }

            // MATCH logic: Find LARGEST conduit area that is <= cable area
            foreach ($IPSMIN as $k => $v) {
                // Skip if no ID data
                if (!isset($v["ID"]) || empty($v["ID"])) {
                    continue;
                }

                $conduitArea = (float)$v[$fillColumn];

                // Keep tracking as long as conduit area <= cable area
                if ($conduitArea <= $cableArea) {
                    $matchedPosition = $k;
                    // Don't break - keep going to find the LARGEST that fits
                } else {
                    // Once we hit a conduit area larger than cable area, stop
                    break;
                }
            }

            // INDEX +1 logic: Return NEXT trade size (position + 1)
            if ($matchedPosition >= 0) {
                $nextPosition = $matchedPosition + 1;

                // Check if next position exists
                if (isset($IPSMIN[$nextPosition]) && isset($IPSMIN[$nextPosition]["original"])) {
                    $IPSMIndex = $IPSMIN[$nextPosition]["original"];
                    $finalIPSMIN = (float)$IPSMIN[$nextPosition][$fillColumn];
                } else {
                    // No next size available - cable area exceeds largest conduit
                    $IPSMIndex = "Select Larger Raceway or Reduce Cables";
                }
            } else {
                // No match found at all (cable area is smaller than smallest conduit)
                // This shouldn't happen, but return the first size just in case
                if (isset($IPSMIN[0]) && isset($IPSMIN[0]["original"])) {
                    $IPSMIndex = $IPSMIN[0]["original"];
                    $finalIPSMIN = (float)$IPSMIN[0][$fillColumn];
                }
            }

            echo json_encode(["status" => true, "index" => $IPSMIndex, "value" => $finalIPSMIN, "type" => $type]);
        } catch (\Throwable $th) {
            echo json_encode(["status" => false, "msg" => $th->getMessage()]);
        }

        die();
    }

    public function inside_diameter_conduit()
    {

        try {
            if (!wp_verify_nonce($_POST['nonce'], 'pullCalculator')) {
                throw new Exception("Invalid Request.");
            }

            global $wpdb;
            /* Get Diameter */
            $diameter = $this->db_get_results("SELECT * FROM `wp_pull_diameter` WHERE `Description` = '" . $_POST["trade_size"] . "\"' AND `type` = '" . $_POST["mode"] . "' ", ARRAY_A);

            if (!isset($diameter[0])) {
                echo json_encode(["status" => true, "ID" => 0, "error" => "Diameter not found."]);
                die();
            }

            $id = $_POST["pipetype"] . $_POST["raceway"] . "TRA" . $diameter[0]["Diameter_Number"];
            $id_alt = $_POST["pipetype"] . "1" . "TRA" . $diameter[0]["Diameter_Number"];
            $ID = $this->db_get_results("Select * from wp_pull_conduit_diameters where Diameter_ID = '" . $id . "'", ARRAY_A);
            $ID_ALT = $this->db_get_results("Select * from wp_pull_conduit_diameters where Diameter_ID = '" . $id_alt . "'", ARRAY_A);

            if (empty($ID)) {
                echo json_encode(["status" => true, "ID" => 0, "error" => "Conduit not found."]);
                die();
            }

            echo json_encode(["status" => true, "ID" => $ID[0]["ID"], "ID_ALT" => $ID_ALT[0]["ID"]]);
        } catch (\Throwable $th) {
            echo json_encode(["status" => false, "msg" => $th->getMessage()]);
        }

        die();
    }

    public function getWeightCorrection()
    {

        try {
            if (!wp_verify_nonce($_POST['nonce'], 'pullCalculator')) {
                throw new Exception("Invalid Request.");
            }

            global $wpdb;

            $_POST["tradeSize"] = (int) $_POST["tradeSize"];
            $key = array_search($_POST["tradeSize"], array_column($this->ORIGINALIPSMIN, 0));
            $angle = $this->ORIGINALIPSMIN[$key][1];
            $conduitCode = $_POST["pipetype"] . $_POST["raceway"] . "TRA" . $angle;


            $diameters = $this->db_get_results("Select * from wp_pull_conduit_diameters where Diameter_ID = '" . $conduitCode . "'", ARRAY_A)[0];

            if (empty($diameters)) {
                throw new Exception("Diameter info not found.");
            }


            switch ($_POST["pullConfiguration"]) {
                case "0Blank":
                    $correction["base"] = 1.000;
                    $correction["main"] = number_format($correction["base"], 2);
                    $correction["configuration"] = "Empty";
                    break;
                case "1Single":
                    $correction["base"] = 1.000;
                    $correction["main"] = number_format($correction["base"], 2);
                    $correction["configuration"] = "Single";
                    break;
                case "2Triangular":

                    $correction["base"] = (1 / sqrt(1 - pow((float) $_POST["maxLength"] / ((float) $diameters["ID"] - ((float) $_POST["maxLength"])), 2)));
                    $correction["main"] = number_format((float) round($correction["base"], 2), 2);
                    $correction["configuration"] = "Triangular";
                    break;
                case "3Cradled":
                    $correction["base"] = (1 + (4 / 3) * pow((float) $_POST["maxLength"] / ((float) $diameters["ID"] - ((float) $_POST["maxLength"])), 2));
                    $correction["main"] = number_format(round($correction["base"], 2), 2);
                    //$correction["main"] = number_format($this->round_up($correction["base"], 3));

                    $correction["configuration"] = "Cradled";
                    break;

                case "3Triangular":
                    $correction["base"] = (1 / sqrt(1 - pow((float) $_POST["maxLength"] / ((float) $diameters["ID"] - ((float) $_POST["maxLength"])), 2)));
                    $correction["main"] = number_format((float) round($correction["base"], 2), 2);
                    //$correction["main"] = $this->round_up($correction["base"], 3);
                    $correction["configuration"] = "Triangular";
                    break;
                case "4Complex":
                    $correction["base"] = 1.40;
                    $correction["main"] = number_format($correction["base"], 3);
                    $correction["configuration"] = "Cradled";
                    break;
            }

            //$correction["base"] is NaN then set it to 0
            if (is_nan($correction["base"]) || $correction["base"] == "nan") {
                $correction["base"] = 0;
            }

            //if $correction["main"] is NaN or nan then set it to 0
            if (is_nan($correction["main"]) || $correction["main"] == "nan") {
                $correction["main"] = 0;
            }

            //$correction["main"] to 2 decimal places
            $correction["main"] = number_format($correction["main"], 2);

            $conduitCode = $_POST["pipetype"] . "1TRA" . $angle;
            $diametersALT = $this->db_get_results("Select * from wp_pull_conduit_diameters where Diameter_ID = '" . $conduitCode . "'", ARRAY_A)[0];

            if (empty($diametersALT)) {
                throw new Exception("Diameter info not found.");
            }

            /* ALT */
            //if $_POST["pullConfigurationALT"] is numeric then set al variables to 0
            if (is_numeric($_POST["pullConfigurationALT"])) {
                $correctionALT["base"] = 0;
                $correctionALT["main"] = 0;
                $correctionALT["configuration"] = 0;
            } else {
                switch ($_POST["pullConfigurationALT"]) {
                    case "0Blank":
                        $correctionALT["base"] = 1.000;
                        $correctionALT["main"] = number_format($correctionALT["base"], 2);
                        $correctionALT["configuration"] = "Empty";
                        break;
                    case "1Single":
                        $correctionALT["base"] = 1.000;
                        $correctionALT["main"] = number_format($correctionALT["base"], 2);
                        $correctionALT["configuration"] = "Single";
                        break;
                    case "2Triangular":

                        $correctionALT["base"] = (1 / sqrt(1 - pow((float) $_POST["maxLength"] / ((float) $diametersALT["ID"] - ((float) $_POST["maxLength"])), 2)));
                        //$correctionALT["main"] = number_format((float) round($correctionALT["base"], 2), 2);
                        $correctionALT["main"] = $this->round_up($correctionALT["base"], 2);
                        $correctionALT["configuration"] = "Triangular";
                        break;
                    case "3Cradled":
                        $correctionALT["base"] = (1 + (4 / 3) * pow((float) $_POST["maxLength"] / ((float) $diametersALT["ID"] - ((float) $_POST["maxLength"])), 2));
                        //$correctionALT["main"] = number_format((float) round($correctionALT["base"], 2), 2);
                        $correctionALT["main"] = $this->round_up($correctionALT["base"], 2);
                        $correctionALT["configuration"] = "Cradled";
                        break;

                    case "3Triangular":
                        $correctionALT["base"] = (1 / sqrt(1 - pow((float) $_POST["maxLength"] / ((float) $diametersALT["ID"] - ((float) $_POST["maxLength"])), 2)));
                        //$correctionALT["main"] = number_format((float) round($correctionALT["base"], 2), 2);
                        $correctionALT["main"] = $this->round_up($correctionALT["base"], 2);
                        $correctionALT["configuration"] = "Triangular";
                        break;
                    case "4Complex":
                        $correctionALT["base"] = 1.40;
                        $correctionALT["main"] = number_format($correctionALT["base"], 2);
                        $correctionALT["configuration"] = "Cradled";
                        break;
                }
            }




            //$correction["base"] is NaN then set it to 0
            if (is_nan($correctionALT["base"]) || $correctionALT["base"] == "nan") {
                $correctionALT["base"] = 0;
            }

            //if $correction["main"] is NaN or nan then set it to 0
            if (is_nan($correctionALT["main"]) || $correctionALT["main"] == "nan") {
                $correctionALT["main"] = 0;
            }

            echo json_encode(["status" => true, "weightCorrection" => $correction, "diameters" => $diameters["ID"], "weightCorrectionALT" => $correctionALT]);
        } catch (\Throwable $th) {
            echo json_encode(["status" => false, "msg" => $th->getMessage()]);
        }

        die();
    }

    public function round_up($v, $p)
    {
        $m = pow(10, abs($p));
        return $p < 0 ? ceil($v / $m) * $m : ceil($v * $m) / $m;
    }

    public function calculateSegments()
    {

        try {
            if (!wp_verify_nonce($_POST['nonce'], 'pullCalculator')) {
                throw new Exception("Invalid Request.");
            }

            global $wpdb;

            foreach (explode("&", $_POST["segments"]) as $k => $v) {

                // Get Segment 
                $segment = $this->db_get_results("SELECT * FROM `wp_pull_bend_section_direction` WHERE `ID` = '" . $v . "'", ARRAY_A)[0];

                if (empty($segment)) {
                    throw new Exception("Segment not found.");
                }

                $segments[$k]["type"] = $segment["second_direction"];
                $segments[$k]["direction"] = $segment["third_direction"];
            }

            //bBasic Coef of fr
            $coefficientArray = $this->db_get_results("SELECT * FROM `wp_pull_coefficient_of_friction` WHERE `ID` = '" . $_POST['raceway'] . $_POST['jacket'] . "'", ARRAY_A)[0];

            if (empty($coefficientArray)) {
                throw new Exception("Coefficient not found.");
            }

            if ($_POST['coefficient_column'] == 2) {
                $coefficient = $coefficientArray["single_pull"];
            }

            if ($_POST['coefficient_column'] == 3) {
                $coefficient = $coefficientArray["multiple_cable_pull"];
            }

            if ($_POST['coefficient_column'] == 4) {
                $coefficient = $coefficientArray["single_multi_Pull"];
            }

            $coefficient_v600 = 0;
            if ($_POST["calcType"] == "v600") {
                $coefficientArray = $this->db_get_results("SELECT * FROM `wp_pull_coefficient_of_friction` WHERE `ID` = '1" . $_POST['jacket'] . "'", ARRAY_A)[0];

                if (empty($coefficientArray)) {
                    throw new Exception("Coefficient not found.");
                }

                if ($_POST['coefficient_column'] == 2) {
                    $coefficient_v600 = $coefficientArray["single_pull"];
                }

                if ($_POST['coefficient_column'] == 3) {
                    $coefficient_v600 = $coefficientArray["multiple_cable_pull"];
                }

                if ($_POST['coefficient_column'] == 4) {
                    $coefficient_v600 = $coefficientArray["single_multi_Pull"];
                }
            }

            $coefficient_alt = 0;
            $coefficientArray = $this->db_get_results("SELECT * FROM `wp_pull_coefficient_of_friction` WHERE `ID` = '1" . $_POST['jacket'] . "'", ARRAY_A)[0];

            if ($_POST['coefficient_column'] == 2) {
                $coefficient_alt = $coefficientArray["single_pull"];
            }

            if ($_POST['coefficient_column'] == 3) {
                $coefficient_alt = $coefficientArray["multiple_cable_pull"];
            }

            if ($_POST['coefficient_column'] == 4) {
                $coefficient_alt = $coefficientArray["single_multi_Pull"];
            }

            /*  if (empty($coefficientArray)) {
            throw new Exception("Coefficient not found.");
            }
            if ($_POST['coefficient_column'] == 2) {
            $coefficient_v600 = $coefficientArray["single_pull"];
            }
            if ($_POST['coefficient_column'] == 3) {
            $coefficient_v600 = $coefficientArray["multiple_cable_pull"];
            }
            if ($_POST['coefficient_column'] == 4) {
            $coefficient_v600 = $coefficientArray["single_multi_Pull"];
            } */

            //Correction
            /*  $correction = $this->db_get_results("SELECT main_wc FROM `wp_pull_weight_correction_factor_table` WHERE `description` LIKE '".$_POST["cableSum"].$_POST["pullConfiguration"]."'", ARRAY_A)[0];
            if( empty($correction) ){
            echo "SELECT main_wc FROM `wp_pull_weight_correction_factor_table` WHERE `description` LIKE '".$_POST["cableSum"].$_POST["pullConfiguration"]."'";
            throw new Exception("Coefficient not found.");
            } */

            echo json_encode(["status" => true, "segments" => $segments, "coefficient" => $coefficient, "coefficient_v600" => $coefficient_v600, "coefficient_alt" => $coefficient_alt]);
        } catch (\Throwable $th) {
            echo json_encode(["status" => false, "msg" => $th->getMessage()]);
        }

        die();
    }

    public function getConduitID()
    {
        try {

            if (!wp_verify_nonce($_POST['nonce'], 'pullCalculator')) {
                throw new Exception("Invalid Request.");
            }

            global $wpdb;

            $_POST["tradeSize"] = $_POST["tradeSize"];
            $key = array_search($_POST["tradeSize"], array_column($this->ORIGINALIPSMIN, 0));
            $angle = $this->ORIGINALIPSMIN[$key][1];
            $conduitID = $_POST["Diameter_ID"] . $angle;

            //Correction
            $diameters = $this->db_get_results("SELECT ID, Weight FROM `wp_pull_conduit_diameters` WHERE `Diameter_ID` LIKE '" . $conduitID . "'", ARRAY_A)[0];

            if (empty($diameters)) {
                $diameterID = 0;
                $weight = 0;
                //throw new Exception("Coefficient not found.");
            } else {
                $diameterID = $diameters["ID"];
                $weight = $diameters["Weight"];
            }

            // if ($_POST["calcType"] == "v600") {
            $diameters_v600 = $this->db_get_results("SELECT ID, Weight FROM `wp_pull_conduit_diameters` WHERE `Diameter_ID` LIKE 'IPS1TRA" . $angle . "'", ARRAY_A)[0];


            if (empty($diameters_v600)) {
                $diameters_v600 = 0;
                $weight_v600 = 0;
                //throw new Exception("Coefficient not found.");
            } else {
                $diametersID_v600 = $diameters_v600["ID"];
                $weight_v600 = $diameters_v600["Weight"];
            }
            // }
            //Wire Profile
            foreach ($_POST["wires"] as $key => $v) {
                //if $v is equal to THHN then continue
                if ($v == "THHN") {

                    $wires[$key]["Copper_max_pull"] = 0;
                    $wires[$key]["Aluminum_hard_max_pull"] = 0;
                    $wires[$key]["Copper_SWBP"] = 0;
                    $wires[$key]["Aluminum_SWBP"] = 0;
                    continue;
                }


                //if $_POST["calcType"] is regular ignore the last item in the array
                if ($_POST["calcType"] == "regular") {
                    if ($key == count($_POST["wires"]) - 1) {
                        break;
                    }
                }
                $wire = $this->db_get_results("SELECT Copper_max_pull, Aluminum_hard_max_pull,Copper_SWBP, Aluminum_SWBP, Copper_SWBP FROM `wp_pull_wire_profiles` WHERE `ID` LIKE '" . addslashes($v) . "'", ARRAY_A)[0];

                if (empty($wire)) {
                    throw new Exception("Wire Profile not found.");
                }
                $wires[$key]["Copper_max_pull"] = ($wire["Copper_max_pull"]);
                $wires[$key]["Aluminum_hard_max_pull"] = ($wire["Aluminum_hard_max_pull"]);
                $wires[$key]["Copper_SWBP"] = ($wire["Copper_SWBP"]);
                $wires[$key]["Aluminum_SWBP"] = ($wire["Aluminum_SWBP"]);
            }

            $maximunSupportDistancesArray = $this->db_get_results("SELECT * FROM `wp_pull_maximun_support_distances` WHERE Cunduit = '" . $angle . "'", ARRAY_A)[0];
            if (empty($maximunSupportDistancesArray)) {
                //throw new Exception("Maximun Support Distances not found.");
                $maximunSupportDistancesArray = array();
                for ($i = 0; $i < $_POST["raceway"]; $i++) {
                    $maximunSupportDistancesArray[$i] = 0;
                }
            } else {
                $maximunSupportDistancesArray = array_values($maximunSupportDistancesArray);
            }

            $labourHours = $this->db_get_results("SELECT * FROM `wp_pull_neca_manual_labour_hours` WHERE Cunduit = '" . $angle . "'", ARRAY_A)[0];

            if (empty($labourHours)) {
                //throw new Exception("Labour Hours not found.");
                $labourHours = array();
                for ($i = 0; $i < $_POST["raceway"]; $i++) {
                    $labourHours[$i] = 0;
                }
            } else {
                $labourHours = array_values($labourHours);
            }

            $ElbowlabourHours = $this->db_get_results("SELECT * FROM `wp_pull_elbow_manual_labour_hours` WHERE Elbow = '" . $angle . "'", ARRAY_A)[0];
            if (empty($ElbowlabourHours)) {
                //throw new Exception("Labour Hours not found.");
                $ElbowlabourHours = array();
                for ($i = 0; $i < $_POST["raceway"]; $i++) {
                    $ElbowlabourHours[$i] = 0;
                }
            } else {
                $ElbowlabourHours = array_values($ElbowlabourHours);
            }


            if ((int) $_POST["raceway"] < 3) {
                $comparisonCable = $this->COMPARISONCHARTS[($_POST["raceway"] + 1)];
                $comparisonCableExtra = $this->COMPARISONCHARTS[($_POST["raceway"] + 1)];

                $labourHoursExtra = $labourHours[($_POST["raceway"])];
                $ElbowlabourHoursExtra = $ElbowlabourHours[($_POST["raceway"])];


                $labourHours = $labourHours[($_POST["raceway"])];
                $ElbowlabourHours = $ElbowlabourHours[($_POST["raceway"])];

                $maximunSupportDistances = $maximunSupportDistancesArray[($_POST["raceway"])];
                $maximunSupportDistancesExtra = $maximunSupportDistancesArray[($_POST["raceway"])];
            } else {
                $comparisonCable = $this->COMPARISONCHARTS[1];
                $comparisonCableExtra = $this->COMPARISONCHARTS[($_POST["raceway"] + 1)];

                $labourHoursExtra = $labourHours[$_POST["raceway"]];
                $ElbowlabourHoursExtra = $ElbowlabourHours[($_POST["raceway"])];

                /* if ($labourHours[($_POST["raceway"])] == "") {
                $labourHours = $labourHours[1];
                $ElbowlabourHours = $ElbowlabourHours[1];
                } else {
                $labourHours = $labourHours[($_POST["raceway"])];
                $ElbowlabourHours = $ElbowlabourHours[($_POST["raceway"])];
                } */

                $labourHours = ($labourHours[1] != "") ? $labourHours[1] : 0;
                $ElbowlabourHours = ($ElbowlabourHours[1] != "") ? $ElbowlabourHours[1] : 0;

                $maximunSupportDistances = ($maximunSupportDistancesArray[1] != "") ? $maximunSupportDistancesArray[1] : 0;
                $maximunSupportDistancesExtra = ($maximunSupportDistancesArray[($_POST["raceway"])] != "") ? $maximunSupportDistancesArray[($_POST["raceway"])] : 0;
            }

            echo json_encode(["status" => true, "ID" => $diameterID, "ID_v600" => $diametersID_v600, "weight_v600" => $weight_v600, "wire" => $wires, "maximunSupportDistance" => $maximunSupportDistances, "maximunSupportDistanceExtra" => $maximunSupportDistancesExtra, "laborHours" => $labourHours, "ElbowLaborHours" => $ElbowlabourHours, "angle" => $angle, "weight" => $weight, "comparisonCable" => $comparisonCable, "laborHoursExtra" => $labourHoursExtra, "ElbowLaborHoursExtra" => $ElbowlabourHoursExtra, "comparisonCableExtra" => $comparisonCableExtra]);
        } catch (\Throwable $th) {
            echo json_encode(["status" => false, "msg" => $th->getMessage()]);
        }

        die();
    }

    public function wireProfile()
    {
        try {

            /* if(!wp_verify_nonce( $_POST['nonce'], 'pullCalculator' )){
            throw new Exception("Invalid Request.");
            } */

            global $wpdb;


            //Wire Profile
            $wire = $this->db_get_results("SELECT Copper_max_pull, Aluminum_hard_max_pull FROM `wp_pull_wire_profiles` WHERE `ID` LIKE '" . addslashes($_REQUEST["wireID"]) . "'", ARRAY_A)[0];

            if (empty($wire)) {
                throw new Exception("Wire Profile not found.");
            }

            foreach ($wire as $key => $v) {
                $wire[$key] = number_format($v);
            }

            echo json_encode(["status" => true, "wire" => $wire]);
        } catch (\Throwable $th) {
            echo json_encode(["status" => false, "msg" => $th->getMessage()]);
        }
        die();
    }

    public function powercablesaveData()
    {

        if (!isset($_POST["data"])) {
            echo json_encode(["status" => false, "msg" => "Invalid Request."]);
            die();
        }

        global $wpdb;

        //check if random string exist
        /*  $checkRandomString = $this->db_get_results("SELECT * FROM `wp_pull_power_cable` WHERE random = '".$_POST["id"]."'", ARRAY_A);

        if( isset($checkRandomString[0]) ){
        $wpdb->update("wp_pull_power_cable", [ "data" => json_encode($_POST["data"]) ], [ "random" => $_POST["id"] ]);
        $randomString = $_POST["id"];
        }else{ */
        //create random string
        $randomString = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 10);

        // Insert data into database
        $wpdb->insert(
            $this->table('pull_power_cable'),
            array(
                "random" => $randomString,
                "data" => json_encode($_POST["data"]),
            )
        );
        /*  } */

        echo json_encode(["status" => true, "id" => $randomString, "msg" => "Data Saved Successfully."]);

        die();
    }

    public function powercableloadData()
    {
        if (!isset($_POST["id"])) {
            echo json_encode(["status" => false, "msg" => "Invalid Request."]);
            die();
        }

        global $wpdb;

        $data = $this->db_get_results("SELECT * FROM `wp_pull_power_cable` WHERE `random` = '" . $_POST["id"] . "'", ARRAY_A)[0];

        if (empty($data)) {
            echo json_encode(["status" => false, "msg" => "Data not found."]);
            die();
        }

        echo json_encode(["status" => true, "data" => json_decode($data["data"])]);

        die();
    }
}

$champion_power_cable_plugin = new champion_power_cable();
register_activation_hook(__FILE__, [$champion_power_cable_plugin, 'activate_plugin']);
