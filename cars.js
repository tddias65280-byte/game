export const cars = [
    {
        id: 1,
        name: "Opala Comodoro 1988",
        category: "Antigos",
        power: 250,
        weight: 1350,
        price: 0,
        maxSpeed: 220,
        acceleration: 7.5,
        color: 0x168b45,
        emoji: "🚘"
    },
    {
        id: 2,
        name: "Caravan 1979 Turbo",
        category: "Turbos",
        power: 450,
        weight: 1450,
        price: 18000,
        maxSpeed: 280,
        acceleration: 5.2,
        color: 0x2222aa,
        emoji: "🚙"
    },
    {
        id: 3,
        name: "Gol Quadrado Turbo",
        category: "Turbos",
        power: 350,
        weight: 950,
        price: 12000,
        maxSpeed: 250,
        acceleration: 5.8,
        color: 0xff2222,
        emoji: "🚗"
    },
    {
        id: 4,
        name: "Maverick V8",
        category: "Antigos",
        power: 400,
        weight: 1500,
        price: 25000,
        maxSpeed: 260,
        acceleration: 5.5,
        color: 0xffaa00,
        emoji: "🏎️"
    },
    {
        id: 5,
        name: "Honda Civic Turbo",
        category: "Turbos",
        power: 500,
        weight: 1250,
        price: 35000,
        maxSpeed: 290,
        acceleration: 4.8,
        color: 0xffffff,
        emoji: "🚗"
    },
    {
        id: 6,
        name: "Nissan Skyline R34",
        category: "Esportivos",
        power: 550,
        weight: 1400,
        price: 50000,
        maxSpeed: 310,
        acceleration: 4.5,
        color: 0x2255ff,
        emoji: "🏎️"
    },
    {
        id: 7,
        name: "Toyota Supra MK4",
        category: "Esportivos",
        power: 600,
        weight: 1400,
        price: 60000,
        maxSpeed: 320,
        acceleration: 4.2,
        color: 0xffcc00,
        emoji: "🏎️"
    },
    {
        id: 8,
        name: "Camaro V8",
        category: "Esportivos",
        power: 650,
        weight: 1650,
        price: 75000,
        maxSpeed: 315,
        acceleration: 4.3,
        color: 0xaa2222,
        emoji: "🏎️"
    }
];

export const upgrades = [
    {
        id: "turbo",
        name: "Kit Turbo",
        description: "Aumenta a potência do motor.",
        price: 8000,
        power: 100
    },
    {
        id: "ecu",
        name: "FuelTech / ECU",
        description: "Melhora o gerenciamento eletrônico.",
        price: 5000,
        power: 40
    },
    {
        id: "nitro",
        name: "Sistema Nitro",
        description: "Adiciona potência extra.",
        price: 12000,
        power: 80
    },
    {
        id: "pneus",
        name: "Pneus de Arrancada",
        description: "Melhora a tração na largada.",
        price: 6000,
        power: 0
    }
];

export function getStats(car, installed = []) {
    const bonus = installed.reduce((sum, upgrade) => {
        const item = upgrades.find(u => u.id === upgrade);
        return sum + (item ? item.power : 0);
    }, 0);

    const tractionBonus = installed.includes("pneus") ? 0.7 : 0;

    return {
        power: car.power + bonus,
        weight: car.weight,
        maxSpeed: car.maxSpeed + Math.floor(bonus * 0.08),
        acceleration: Math.max(
            2.5,
            car.acceleration - bonus * 0.003 - tractionBonus
        )
    };
}