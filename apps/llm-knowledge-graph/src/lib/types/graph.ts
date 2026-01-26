export interface Node {
    id: string;
    type: string;
    label: string;
}

export interface Relationship {
    source: string;
    target: string;
    type: string;
}

export interface GraphData {
    nodes: Node[];
    relationships: Relationship[];
}