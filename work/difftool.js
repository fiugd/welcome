import { prism, importCSS, consoleHelper } from '../.tools/misc.mjs'
import '../shared.styl';
consoleHelper();
const logJSON = x => prism('javascript', JSON.stringify(x,null,2))
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const concat = (...arrs) => [].concat(...arrs);
const unique = array => [...new Set(array)]
const sort = array => array.sort()

const all = [1,2,3]
const one = [2,3,5]


const tickets = () => {
	return `
		alternateNetVolume?: number;
		alternateNetVolumeUom?: string;
		carrier?: string;
		carrierLookupValue?: string;
		carrierBatchCode?: string;
		company?: string;
		companyLookupValue?: string | string[];
		consignee?: string;
		consigneeLookupValue?: string;
		correctedGravity?: number;
		correctionCode?: string;
		createdDate?: string;
		cycle?: string;
		destinationCity?: string;
		eventId?: number;
		eventType?: string;
		externalBatchId?: string;
		flexLocation?: string;
		flexLocationLookupValue?: string;
		hasGrantee?: string;
		grossVolume?: number;
		grossVolumeUom?: string;
		gsv?: number;
		isTptGrantable?: string;
		lastChangedDate?: string;
		lease?: string;
		legacyBatchCode?: string;
		lineSegment?: string;
		lineSegmentLookupValue?: string;
		location?: string;
		locationDescription?: string;
		locationLookupValue?: string;
		locationNumber?: string;
		meterId?: number;
		netVolume?: number;
		netVolumeUom?: string;
		nomId?: number;
		nomType?: string;
		contractNumber?: string;
		nomTypeLookupValue?: string;
		paperTicketNumber?: string;
		permissions?: string[];
		processDate?: string;
		product?: string;
		productDescription?: string;
		productLookupValue?: string;
		productGroup?: string;
		productGroupLookupValue?: string;
		productType?: string;
		productTypeLookupValue?: string;
		provingReport?: string;
		railCarrier?: string;
		scd?: string;
		scdLookupValue?: string;
		sequence?: string;
		sequencLookupValue?: string;
		shipper?: string;
		shipperLookupValue?: string;
		shipperAcctAbbr?: string;
		sisNomId?: number;
		startDate?: string;
		stopDate?: string;
		supplier?: string;
		supplierLookupValue?: string;
		tankage?: string;
		tankageLookupValue?: string;
		tankCarNumber?: string;
		ticketDate?: string;
		ticketId?: number;
		ticketNumber?: string;
		ticketNumberWithoutVersion?: string;
		ticketType?: string;
		ticketTypeDescription?: string;
		ticketTypeLookupValue?: string;
		ticketVersion?: string;
		toBatchCode?: string;
		toShipper?: string;
		toShipperLookupValue?: string;
		totalsAggregationLabel?: string;
		truckCarrier?: string;
`
}
const schedules = () => {
	return `
		action?: string;
		actionLookupValue?: string;
		batchVolume?: number;
		carrier?: string;
		carrierBatchCode?: string;
		carrierLookupValue?: string;
		carrierRemark?: string;
		carrierScheduleKey?: number;
		commodityCodes?: string;
		company?: string;
		companyLookupValue?: string | string[];
		consignee?: string;
		consigneeLookupValue?: string;
		coverage?: string;
		createdBy?: string;
		createdDate?: string;
		custodyEvent?: string;
		cycle?: string;
		eventStartDate?: string;
		eventStopDate?: string;
		eventType?: string;
		eventChildren?: Array<ScheduleSearchResult>;
		externalBatchId?: string;
		flowRate?: number;
		hasGrantee?: string;
		inOut?: string;
		isTptGrantable?: string;
		legacyBatchCode?: string;
		lineSegment?: string;
		lineSegmentLookupValue?: string;
		location?: string;
		locationDescription?: string;
		locationLookupValue?: string;
		locationSequence?: number;
		locationType?: string;
		maxScheduleDate?: string;
		originLocation?: string;
		parentId?: number;
		permissions?: string[];
		priorVersion?: ScheduleSearchResult;
		product?: string;
		productDescription?: string;
		productLookupValue?: string;
		productType?: string;
		productTypeLookupValue?: string;
		remarks?: string;
		scd?: string;
		scdDescription?: string;
		scdLookupValue?: string;
		scheduleViewType?: string[];
		scheduleEventType?: string;
		scheduleKey?: number;
		scheduleType?: string;
		scheduleVersion?: number;
		scheduleVolume?: number;
		sequence?: string;
		sequenceLookupValue?: string;
		shipper?: string;
		shipperLookupValue?: string;
		shipperBatchId?: string;
		supplier?: string;
		supplierLookupValue?: string;
		tankage?: string;
		tankageLookupValue?: string;
		tankNumber?: string;
		uom?: string;
`
}
const noms = () => {
	return `
		eventIdentity?: number;
		agent?: string;
		alternateNetVolume?: number;
		alternateNetVolumeUom?: string;
		batchCreatedDate?: string;
		carrier?: string;
		carrierLookupValue?: string;
		carrierBatchCode?: string;
		carrierConfirmationStatus?: string;
		carrierConfirmationStatusDescription?: string;
		carrierConfirmationBy?: SearchResultUser;
		company?: string[];
		companyLookupValue?: string | string[];
		compButane?: number;
		compCPlus?: number;
		compEthane?: number;
		compIsobutane?: number;
		compPropane?: number;
		compUOM?: string;
		connectingCarrierId?: number;
		containerTank?: string;
		containerDetails?: string;
		contract?: string;
		correctedGravity?: number;
		correctionCode?: string;
		createdBy?: SearchResultUser;
		createdDate?: string;
		customerReference?: string;
		cycle?: string;
		cycleYear?: string;
		deleted?: boolean;
		destinationCity?: string;
		equivalentFactor?: number;
		equivalentVolume?: number;
		eventId?: number;
		eventType?: string;
		eventTypeDescription?: string;
		eventPriority?: number;
		expirationDate?: string;
		externalBatchId?: string;
		flexLocation?: string;
		flexLocationDescription?: string;
		flexLocationLookupValue?: string;
		fulfilledTank?: string;
		hasGrantee?: string;
		grossVolume?: number;
		grossVolumeUom?: string;
		gsv?: number;
		inspector1?: string;
		inspector2?: string;
		instructions?: string;
		isTptGrantable?: string;
		lastChangedDate?: string;
		lease?: string;
		legacyBatchCode?: string;
		lineSegment?: string;
		lineSegmentLookupValue?: string;
		linkShipper?: string;
		linkProduct?: string;
		linkCycle?: string;
		linkSequence?: string;
		linkSCD?: string;
		linkBatchCode?: string;
		location?: string;
		locationDescription?: string;
		locationLookupValue?: string;
		locationNumber?: string;
		maxLoad?: boolean;
		meterId?: number;
		minorVersion?: number;
		netVolume?: number;
		netVolumeUom?: string;
		nomId?: number;
		nomType?: string;
		nomTypeDescription?: string;
		nomTypeLookupValue?: string;
		nomVersion?: number;
		numberOfRails?: number;
		numberOfTrucks?: number;
		paperNomNumber?: string;
		permissions?: string[];
		processDate?: string;
		product?: string;
		productDescription?: string;
		productLookupValue?: string;
		productGroup?: string;
		productGroupLookupValue?: string;
		productType?: string;
		productTypeLookupValue?: string;
		projectedDate?: string;
		projectedDateSource?: string;
		provingReport?: string;
		ptoId?: number;
		railNumber?: string;
		railCarNumber?: string;
		remainingVolume?: number;
		remark?: string;
		requestedDate?: string;
		requestedBy?: SearchResultUser;
		scd?: string;
		scdLookupValue?: string;
		scheduledBatchCode?: string;
		scheduledCarrier?: string;
		scheduledShipper?: string;
		scheduledProduct?: string;
		scheduledCycle?: string;
		scheduledSequence?: string;
		scheduledScd?: string;
		scheduledEventType?: string;
		scheduledLocation?: string;
		scheduledStartTime?: string;
		scheduledSupplierConsignee?: string;
		scheduledTanker?: string;
		scheduledVolume?: number;
		scheduledDate?: string;
		sequence?: string;
		sequencLookupValue?: string;
		shipper?: string;
		shipperBatchId?: number;
		shipperExternalIndicator?: string;
		shipperLookupValue?: string;
		shipperConfirmationStatus?: string;
		shipperConfirmationStatusDate?: string;
		shipperConfirmationStatusDescription?: string;
		shipperConfirmationStatusBy?: SearchResultUser;
		shipperAcctAbbr?: string;
		shipToName?: string;
		shipToAddress1?: string;
		shipToAddress2?: string;
		shipToCity?: string;
		shipToState?: string;
		shipToPostalCode?: string;
		sisNomId?: number;
		startDate?: string;
		stopDate?: string;
		supplierConsignee?: string;
		supplierConsigneeDescription?: string;
		supplierConsigneeLookupValue?: string;
		supplierConsigneeConfirmationStatus?: string;
		supplierConsigneeConfirmationStatusDate?: string;
		supplierConsigneeConfirmationStatusDescription?: string;
		supplierConsigneeConfirmationBy?: SearchResultUser;
		tankage?: string;
		tankageLookupValue?: string;
		tankageConfirmationStatus?: string;
		tankageConfirmationStatusDate?: string;
		tankageConfirmationStatusDescription?: string;
		tankageConfirmationStatusBy?: SearchResultUser;
		tankCarNumber?: string;
		tankInUse?: boolean;
		tickets?: NomResultTicket[];
		toBatchCode?: string;
		toShipper?: string;
		toShipperLookupValue?: string;
		totalsAggregationLabel?: string;
		touchedOn?: string;
		touchedBy?: SearchResultUser;
		tripNumber?: string;
		trailerNumber?: string;
		truckCarrier?: string;
`
}
const parseLines = (input) => {
	return input
		.split('\n')
		.filter(x => !!x)
		.map(x => x.trim().split(/:/)[0].replace(/\?$/,''))
}

const ticketsProps = pipe(tickets, parseLines)();
const schedulesProps = pipe(schedules, parseLines)();
const nomsProps = pipe(noms, parseLines)();

const isMissing = (source, dest) => dest.filter(x => !source.includes(x))
const missingFromEach = (allProps) => {
	return [ticketsProps, schedulesProps, nomsProps]
		.map(x => isMissing(x, allProps))
		.map(x => {
			return {
				//tickets: x.filter(y => ticketsProps.includes(y)),
				schedules: x.filter(y => schedulesProps.includes(y)),
				noms: x.filter(y => nomsProps.includes(y)),
			}
		})
}

logJSON(
	pipe(concat, unique, sort, missingFromEach)(
		ticketsProps,
		schedulesProps,
		nomsProps,
	)
)

logJSON({onlyInFirstAndSecond});
logJSON({onlyInFirstAndThird});
logJSON({onlyInSecondAndThird});
logJSON({inAllThree})