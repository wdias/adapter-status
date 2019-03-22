import { Decoder, object, string, oneOf, constant, optional } from '@mojotech/json-type-validation';

// 1. ModuleId
// 2. ValueType
export enum ValueType {
  Scalar = 'Scalar',
  Vector = 'Vector',
  Grid = 'Grid',
}

// 3. Parameter
export enum ParameterType {
  Instantaneous = 'Instantaneous',
  Accumulative = 'Accumulative',
  Mean = 'Mean',
}

export type Parameter = {
  parameterId: string,
  variable: string,
  unit: string,
  parameterType: ParameterType,
}

// 4. Location
export type Location = {
  locationId: string,
  name: string,
  lat: number,
  lon: number,
  elevation?: number,
  description?: string,
}

// 5. TimeseriesType
export enum TimeseriesType {
  ExternalHistorical = 'ExternalHistorical',
  ExternalForecasting = 'ExternalForecasting',
  SimulatedHistorical = 'SimulatedHistorical',
  SimulatedForecasting = 'SimulatedForecasting',
}

// 6. TimeStep
export enum TimeStepUnit {
  Second = 'Second',
  Minute = 'Minute',
  Hour = 'Hour',
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'Year',
  NonEquidistant = 'NonEquidistant',
}
export type TimeStep = {
  timeStepId: string,
  unit: TimeStepUnit,
  multiplier?: number,
  divider?: number,
}

// Metadata
export type Metadata = {
  moduleId: string,
  valueType: ValueType,
  parameter: Parameter,
  location: Location,
  timeseriesType: TimeseriesType,
  timeStep: TimeStep,
}
export type MetadataIds = {
  moduleId: string,
  valueType: ValueType,
  parameterId: string,
  locationId: string,
  timeseriesType: TimeseriesType,
  timeStepId: string,
}
export const metadataIdsDecoder: Decoder<MetadataIds> = object({
  moduleId: string(),
  valueType: oneOf(constant(ValueType.Scalar), constant(ValueType.Vector), constant(ValueType.Grid)),
  parameterId: string(),
  locationId: string(),
  timeseriesType: oneOf(constant(TimeseriesType.ExternalHistorical), constant(TimeseriesType.ExternalForecasting), constant(TimeseriesType.SimulatedHistorical), constant(TimeseriesType.SimulatedForecasting)),
  timeStepId: string(),
});

// DataPoint
export type DataPoint = {
  time: string | number,
  value: number,
}

// TimeSeries
export type TimeSeries = {
  timeSeriesId: string,
  metadataIds: MetadataIds,
  data: DataPoint[],
}

// Status
export type Status = {
  requestId: string,
  service: string,
  type: string,
  extensionFunction?: string,
}

export const statusDecoder: Decoder<Status> = object({
  requestId: string(),
  service: oneOf(constant('Import'), constant('Export'), constant('Extension')),
  type: oneOf(constant('Scalar'), constant('Vector'), constant('Grid'), constant('Transformation'), constant('Validation'), constant('Interpolation')),
  extensionFunction: optional(string()),
});
