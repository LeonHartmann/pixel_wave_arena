export const WORLDS = [
    {
        id: 'tech',
        name: 'CYBER SECTOR',
        waves: 30,
        difficultyOffset: 0,
        colors: {
            bg: '#111',
            floor: '#222',
            grid: '#333',
            wall: '#34495e',
            wallTop: '#ecf0f1',
            wallShadow: '#2c3e50'
        }
    },
    {
        id: 'magma',
        name: 'MAGMA CORE',
        waves: 30,
        difficultyOffset: 30,
        colors: {
            bg: '#1a0505',
            floor: '#2c0e0e',
            grid: '#e74c3c',
            wall: '#c0392b',
            wallTop: '#f1c40f',
            wallShadow: '#7f2c2c'
        }
    },
    {
        id: 'ice',
        name: 'FROZEN WASTE',
        waves: 30,
        difficultyOffset: 60,
        colors: {
            bg: '#05101a',
            floor: '#0e1a2c',
            grid: '#3498db',
            wall: '#2980b9',
            wallTop: '#ecf0f1',
            wallShadow: '#1a5276'
        }
    },
    {
        id: 'void',
        name: 'THE VOID',
        waves: 9999,
        difficultyOffset: 90,
        colors: {
            bg: '#05000a',
            floor: '#0a0014',
            grid: '#8e44ad',
            wall: '#4b0082',
            wallTop: '#9b59b6',
            wallShadow: '#26004d'
        }
    }
];

export function getWorldById(id) {
    return WORLDS.find(w => w.id === id) || WORLDS[0];
}
