//show-preview

/*
	the idea here is to fake an object that is big as it can be and measure how big it is
*/

import { importCSS, prism, consoleHelper } from './.tools/misc.mjs';
import './shared.styl';

consoleHelper();

const parameters = [
	{ name: "acct_status", type: "char(1)" },
	{ name: "advanced_query", type: "char(1)" },
	{ name: "attp_status_code", type: "char(1)" },
	//{ name: "bill_to_company_list", type: "varchar(100)" },
	{ name: "bol_nbr", type: "varchar(20)" },
	{ name: "bol_ticket_nbr", type: "varchar(20)" },
	{ name: "bookout_date", type: "varchar(25)" },
	{ name: "bookout_status", type: "char(1)" },
	{ name: "broker", type: "char(12)" },
	{ name: "broker_trade_id", type: "char(24)" },
	{ name: "bulletin_terminal_id", type: "int" },
	{ name: "carrier_conf_status", type: "varchar(100)" },
	{ name: "carrier_entity_id", type: "varchar(4)" },
	{ name: "carrier_facility_id", type: "varchar(5)" },
	{ name: "carrier_list", type: "varchar(100)" },
	{ name: "company_list", type: "varchar(100)" },
	{ name: "container_details", type: "VARCHAR(256)" },
	{ name: "container_list", type: "VARCHAR(100)" },
	{ name: "contract_list", type: "VARCHAR(100)" },
	{ name: "counter_party", type: "varchar(3)" },
	{ name: "counter_party_trade_id", type: "char(24)" },
	{ name: "coverage", type: "varchar(64)" },
	{ name: "created_date_criteria", type: "varchar(50)" },
	{ name: "cust_pl_sys", type: "VARCHAR(3)" },
	{ name: "cust_point", type: "varchar(20)" },
	//{ name: "customer_list", type: "varchar(100)" },
	{ name: "customer_reference", type: "VARCHAR(16)" },
	{ name: "cycle_list", type: "varchar(256)" },
	{ name: "date_criteria_day_type", type: "char(1)" },
	//{ name: "destination_list", type: "varchar(100)" },
	{ name: "display_coverages", type: "char(1)" },
	{ name: "display_cycle", type: "char(1)" },
	{ name: "display_external_batch_id", type: "char(1)" },
	{ name: "display_legacy_batch_code", type: "char(1)" },
	{ name: "display_nom_vol", type: "char(1)" },
	{ name: "display_origin_loc", type: "char(1)" },
	{ name: "display_receipt_date", type: "char(1)" },
	{ name: "display_remarks", type: "char(1)" },
	{ name: "display_shipper_batch_id", type: "char(1)" },
	{ name: "display_stop_date", type: "char(1)" },
	//{ name: "driver_list", type: "varchar(100)" },
	//{ name: "email_address_list", type: "varchar(255)" },
	//{ name: "employed_by_company_list", type: "varchar(100)" },
	{ name: "event_date_criteria", type: "varchar(50)" },
	{ name: "event_type_list", type: "varchar(100)" },
	{ name: "expire_date_criteria", type: "varchar(25)" },
	{ name: "flex_location_list", type: "varchar(100)" },
	{ name: "flow_date_criteria", type: "varchar(25)" },
	//{ name: "fname_list", type: "varchar(100)" },
	{ name: "from_shipper_conf_status", type: "char(1)" },
	//{ name: "gauge_type_list", type: "varchar(100)" },
	//{ name: "group_by", type: "VARCHAR(100)" },
	//{ name: "hour", type: "numeric(2,0)" },
	{ name: "id_list", type: "varchar(100)" },
	{ name: "include_confirmed", type: "char(1)" },
	{ name: "include_connected_fac", type: "VARCHAR(1)" },
	{ name: "include_on_allocation", type: "char(1)" },
	//{ name: "include_proving", type: "char(1)" },
	{ name: "include_voided", type: "char(1)" },
	{ name: "inspector_list", type: "varchar(100)" },
	//{ name: "invoice_date_criteria", type: "varchar(25)" },
	{ name: "invoice_number", type: "bigint" },
	{ name: "invoice_type", type: "char(3)" },
	//{ name: "involved_party_list", type: "varchar(100)" },
	{ name: "legacy_batch_code", type: "varchar(100)" },
	{ name: "letter_number", type: "varchar(9)" },
	{ name: "line_segment_list", type: "varchar(100)" },
	//{ name: "lname_list", type: "varchar(100)" },
	{ name: "location_list", type: "varchar(100)" },
	//{ name: "meter_id", type: "varchar(64)" },
	{ name: "month", type: "numeric(2,0)" },
	//{ name: "movement_type_list", type: "varchar(100)" },
	//{ name: "operator_list", type: "varchar(100)" },
	{ name: "order_by", type: "varchar(150)" },
	//{ name: "origin_list", type: "varchar(100)" },
	//{ name: "padd_list", type: "varchar(100)" },
	{ name: "page_number", type: "tinyint" },
	//{ name: "paper_ticket_num", type: "varchar(25)" },
	{ name: "parcel_id", type: "varchar(25)" },
	{ name: "partner_entity_id", type: "varchar(4)" },
	{ name: "partner_facility_id", type: "varchar(5)" },
	{ name: "period_code", type: "char(2)" },
	//{ name: "period_list", type: "varchar(100)" },
	{ name: "period_type", type: "char(1)" },
	//{ name: "phone_list", type: "varchar(100)" },
	{ name: "process_date_criteria", type: "varchar(50)" },
	//{ name: "product_group", type: "VARCHAR(8)" },
	{ name: "product_list", type: "varchar(100)" },
	{ name: "pto_number", type: "int" },
	{ name: "pto_type_list", type: "char(1)" },
	//{ name: "publisher_list", type: "varchar(100)" },
	//{ name: "publisher_type_list", type: "varchar(100)" },
	{ name: "push_request_type", type: "char(1)" },
	{ name: "query_sec", type: "decimal(6,3)" },
	{ name: "rcpt_delvr", type: "char(1)" },
	//{ name: "rcvng_party_acct_abbr_list" },
	//{ name: "rcvng_party_list", type: "varchar(100)" },
	{ name: "receipt_date_criteria", type: "varchar(25)" },
	{ name: "report_type", type: "varchar(20)" },
	{ name: "reversal_ind", type: "VARCHAR(1)" },
	{ name: "scd_list", type: "varchar(256)" },
	//{ name: "schedule_status_list", type: "varchar(100)" },
	//{ name: "schedule_view_type", type: "varchar(100)" },
	{ name: "seq_number", type: "varchar(10)" },
	{ name: "sequence_list", type: "varchar(100)" },
	{ name: "session_id", type: "varchar (50)" },
	{ name: "shipper_acct_abbr_list", type: "varchar(100)" },
	{ name: "shipper_batch_id", type: "varchar(30)" },
	{ name: "shipper_conf_status", type: "VARCHAR(100)" },
	{ name: "shipper_list", type: "varchar(100)" },
	{ name: "shipper_trade_id", type: "varchar(24)" },
	{ name: "show_all", type: "char(1)" },
	{ name: "show_maint_noms", type: "CHAR (1)" },
	{ name: "show_my_noms", type: "char(1)" },
	{ name: "sis_nom_type_list", type: "varchar(100)" },
	{ name: "sis_page_key", type: "varchar(20)" },
	{ name: "sis_page_return_type_id", type: "int" },
	{ name: "sis_product_type_list", type: "varchar(100)" },
	{ name: "sis_pto_id_list", type: "varchar(100)" },
	//{ name: "stop_date_criteria", type: "varchar(50)" },
	{ name: "sup_con_conf_status", type: "varchar(100)" },
	{ name: "sup_con_list", type: "varchar(100)" },
	{ name: "system_name", type: "varchar(64)" },
	{ name: "tank_number", type: "varchar(15)" },
	{ name: "tank_product", type: "varchar(20)" },
	{ name: "tanker_conf_status", type: "varchar(100)" },
	{ name: "tanker_list", type: "varchar(100)" },
	{ name: "terminal_list", type: "varchar(100)" },
	{ name: "ticket_number", type: "varchar(18)" },
	{ name: "tkcar_nbr", type: "varchar(12)" },
	//{ name: "tms_bol_type_list", type: "varchar(100)" },
	//{ name: "tms_carrier_list", type: "varchar(100)" },
	//{ name: "tms_product_type_list", type: "varchar(100)" },
	{ name: "to_shipper_conf_status", type: "char(1)" },
	//{ name: "to_shipper_list", type: "varchar(100)" },
	{ name: "touched_date_criteria", type: "varchar(50)" },
	{ name: "trade_date_criteria", type: "varchar(25)" },
	{ name: "trade_status", type: "char(1)" },
	{ name: "trade_type", type: "varchar(8)" },
	{ name: "tran_type", type: "char(1)" },
	//{ name: "transport_type_list", type: "varchar(100)" },
	//{ name: "ulsd_product_type_list", type: "varchar(100)" },
	{ name: "units_of_measure", type: "VARCHAR(5)" },
	{ name: "user_code", type: "varchar (20)" },
	//{ name: "user_code_list", type: "varchar(100)" },
	//{ name: "user_type_list", type: "varchar(100)" },
	{ name: "version", type: "decimal(6,3)" },
	{ name: "volume", type: "int" },
	{ name: "year", type: "numeric(4,0)" },
];

function fakeOne(one){
	const generic = (v, y = 0) => new Array(Number(v) + Number(y)).fill("*").join("");

	const char = generic;
	const varchar = generic;
	const int = generic;
	const numeric = generic;
	const decimal = generic;

	const literal = {
		bigint: "**",
		tinyint: "*",
		int: "*",
	};

	return one.type.toLowerCase().includes("(")
		? eval(one.type.toLowerCase())
		: literal[one.type.toLowerCase()];
}

function fakeAll(all, one){
	all[one.name] = fakeOne(one);
	return all;
}

const fakedObject = parameters.reduce(fakeAll, {});
console.info(JSON.stringify(fakedObject, null, 2).length + ' chars');

