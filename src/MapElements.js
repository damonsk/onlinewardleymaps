export default class MapElements {

    constructor(mapObject){
        this.mapObject = mapObject;
    }

    getEvolveElements(){
        return this.mapObject.elements.filter(el => el.evolving);
    }

    getNoneEvolvingElements(){
        return this.mapObject.elements.filter(el => el.evolving == false);
    }

    getNonEvolvedElements(){
        return this.getNoneEvolvingElements().concat(this.getEvolveElements());
    }

}