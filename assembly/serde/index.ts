/* eslint-disable require-jsdoc */
import {JSONEncoder} from 'assemblyscript-json';
import {JSONDecoder, JSONHandler} from 'assemblyscript-json';

export abstract class DataSerializer extends JSONHandler {
  private encoder: JSONEncoder;

  constructor() {
    super();
    this.encoder = new JSONEncoder();
  }

  setString(name: string, value: string): void {
    this.encoder.setString(name, value);
  }

  setBoolean(name: string, value: bool): void {
    this.encoder.setBoolean(name, value);
  }

  setInteger(name: string, value: i64): void {
    this.encoder.setInteger(name, value);
  }

  setFloat(name: string, value: f64): void {
    this.encoder.setFloat(name, value);
  }

  serializeToString(): string {
    const jsonString: string = this.encoder.toString();
    return jsonString;
  }

  serializeToBytes(): Uint8Array {
    const bytes: Uint8Array = this.encoder.serialize();
    return bytes;
  }

  public getEncoder(): JSONEncoder {
    return this.encoder;
  }
}
