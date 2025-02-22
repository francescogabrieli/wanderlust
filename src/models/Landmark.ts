export class Landmark {
    constructor(
        public id: string,
        public name: string,
        public latitude: number,
        public longitude: number,
        public picture: string,
        public hint: string,
        public extraHint: string,
        public found: boolean = false
    ) {}

    toString(): string {
        return `
        ID: ${this.id}
        Name: ${this.name}
        Latitude: ${this.latitude.toFixed(6)}
        Longitude: ${this.longitude.toFixed(6)}
        Hint: ${this.hint}
        Extra Hint: ${this.extraHint}
        Found: ${this.found ? "Yes" : "No"}
        Picture: ${this.picture}
        `;
    }
}