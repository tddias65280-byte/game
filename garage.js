
import { cars, getStats } from "./cars.js";

export class Garage {
    constructor(onUpdate) {
        this.onUpdate = onUpdate;

        let saved = {};

        try {
            saved = JSON.parse(
                localStorage.getItem("dragGarage") || "{}"
            );
        } catch (error) {
            console.warn("Dados antigos da garagem inválidos.");
        }

        this.credits = saved.credits ?? 50000;
        this.owned = saved.owned ?? [1];
        this.selectedId = saved.selectedId ?? 1;
        this.upgrades = saved.upgrades ?? {};

        if (!this.owned.includes(1)) {
            this.owned.unshift(1);
        }

        if (!this.owned.includes(this.selectedId)) {
            this.selectedId = 1;
        }

        this.save();
    }

    get selectedCar() {
        return cars.find(car => car.id === this.selectedId) || cars[0];
    }

    getSelectedUpgrades() {
        return this.upgrades[this.selectedId] || [];
    }

    getSelectedStats() {
        return getStats(
            this.selectedCar,
            this.getSelectedUpgrades()
        );
    }

    save() {
        localStorage.setItem("dragGarage", JSON.stringify({
            credits: this.credits,
            owned: this.owned,
            selectedId: this.selectedId,
            upgrades: this.upgrades
        }));
    }

    update() {
        this.save();

        if (this.onUpdate) {
            this.onUpdate();
        }
    }

    buy(id) {
        const car = cars.find(item => item.id === Number(id));

        if (!car || this.owned.includes(car.id)) {
            return false;
        }

        if (this.credits < car.price) {
            alert("Você não tem créditos suficientes!");
            return false;
        }

        this.credits -= car.price;
        this.owned.push(car.id);

        this.update();
        return true;
    }

    select(id) {
        id = Number(id);

        if (!this.owned.includes(id)) {
            return false;
        }

        this.selectedId = id;
        this.update();

        return true;
    }

    installUpgrade(upgrade) {
        const installed = this.getSelectedUpgrades();

        if (installed.includes(upgrade.id)) {
            alert("Essa melhoria já está instalada!");
            return false;
        }

        if (this.credits < upgrade.price) {
            alert("Créditos insuficientes!");
            return false;
        }

        this.credits -= upgrade.price;

        if (!this.upgrades[this.selectedId]) {
            this.upgrades[this.selectedId] = [];
        }

        this.upgrades[this.selectedId].push(upgrade.id);

        this.update();
        return true;
    }

    // Ilustração lateral do veículo
    carIllustration(car) {
        const color = "#" + car.color.toString(16).padStart(6, "0");

        return `
            <svg viewBox="0 0 340 145" role="img"
                aria-label="${car.name}">
                <defs>
                    <linearGradient id="paint-${car.id}" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#ffffff" stop-opacity=".45"/>
                        <stop offset="100%" stop-color="${color}"/>
                    </linearGradient>
                </defs>

                <ellipse cx="170" cy="120" rx="125" ry="10"
                    fill="#000" opacity=".35"/>

                <path d="M38 99 L48 78 L91 70 L119 40
                    Q130 27 151 27 L208 27
                    Q225 28 242 53 L278 70
                    L300 80 L307 101 L295 111
                    L45 111 Z"
                    fill="url(#paint-${car.id})"
                    stroke="#111820" stroke-width="4"/>

                <path d="M112 68 L133 37 Q139 32 153 32
                    L174 32 L174 68 Z"
                    fill="#172b3c" stroke="#91a9bd" stroke-width="2"/>

                <path d="M181 32 L207 32 Q220 34 235 68
                    L181 68 Z"
                    fill="#172b3c" stroke="#91a9bd" stroke-width="2"/>

                <path d="M43 85 L91 76 L100 92 L43 96 Z"
                    fill="${color}" opacity=".7"/>

                <rect x="45" y="83" width="13" height="9"
                    rx="2" fill="#ff3030"/>

                <rect x="286" y="83" width="13" height="9"
                    rx="2" fill="#fff0b0"/>

                <circle cx="95" cy="106" r="23"
                    fill="#080a0d" stroke="#555e68" stroke-width="4"/>

                <circle cx="95" cy="106" r="11"
                    fill="#b8c1ca" stroke="#343b44" stroke-width="3"/>

                <circle cx="258" cy="106" r="23"
                    fill="#080a0d" stroke="#555e68" stroke-width="4"/>

                <circle cx="258" cy="106" r="11"
                    fill="#b8c1ca" stroke="#343b44" stroke-width="3"/>

                <path d="M35 112 H310"
                    stroke="#ffffff" stroke-opacity=".4" stroke-width="2"/>
            </svg>
        `;
    }

    renderGarage(container) {
        container.innerHTML = "";

        const ownedCars = cars.filter(car =>
            this.owned.includes(car.id)
        );

        ownedCars.forEach(car => {
            const selected = car.id === this.selectedId;
            const stats = getStats(
                car,
                this.upgrades[car.id] || []
            );

            container.innerHTML += `
                <article class="car-card ${selected ? "selected-car" : ""}">
                    <div class="car-art">
                        ${this.carIllustration(car)}
                    </div>

                    <div class="car-info">
                        <h3>${car.name}</h3>
                        <p>${car.category}</p>

                        <div class="spec-grid">
                            <div>
                                <small>POTÊNCIA</small>
                                <b>${stats.power} cv</b>
                            </div>
                            <div>
                                <small>VELOCIDADE</small>
                                <b>${stats.maxSpeed} km/h</b>
                            </div>
                        </div>

                        <button class="card-btn"
                            data-select-car="${car.id}"
                            ${selected ? "disabled" : ""}>
                            ${selected ? "VEÍCULO SELECIONADO" : "USAR ESTE CARRO"}
                        </button>
                    </div>
                </article>
            `;
        });
    }

    renderCatalog(container, category = "Todos") {
        container.innerHTML = "";

        const availableCars = cars.filter(car =>
            category === "Todos" || car.category === category
        );

        availableCars.forEach(car => {
            const owned = this.owned.includes(car.id);

            container.innerHTML += `
                <article class="car-card">
                    <div class="car-art">
                        ${this.carIllustration(car)}
                    </div>

                    <div class="car-info">
                        <h3>${car.name}</h3>
                        <p>${car.category}</p>

                        <div class="spec-grid">
                            <div>
                                <small>POTÊNCIA</small>
                                <b>${car.power} cv</b>
                            </div>
                            <div>
                                <small>VELOCIDADE</small>
                                <b>${car.maxSpeed} km/h</b>
                            </div>
                            <div>
                                <small>PESO</small>
                                <b>${car.weight} kg</b>
                            </div>
                            <div>
                                <small>ACELERAÇÃO</small>
                                <b>${car.acceleration}</b>
                            </div>
                        </div>

                        <p class="car-price">
                            ${owned ? "ADQUIRIDO" :
                                "R$ " + car.price.toLocaleString("pt-BR")}
                        </p>

                        <button class="card-btn"
                            data-buy-car="${car.id}"
                            ${owned ? "disabled" : ""}>
                            ${owned ? "JÁ É SEU" : "COMPRAR VEÍCULO"}
                        </button>
                    </div>
                </article>
            `;
        });
    }
}
