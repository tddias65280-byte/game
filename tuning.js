import { upgrades } from "./cars.js";

export class Tuning {
    constructor(garage, container) {
        this.garage = garage;
        this.container = container;

        this.render();
    }

    render() {
        const car = this.garage.selectedCar;
        const stats = this.garage.getSelectedStats();
        const installed = this.garage.getSelectedUpgrades();

        this.container.innerHTML = `
            <div class="tuning-card">
                <p class="tag">VEÍCULO NA OFICINA</p>
                <h2>${car.name}</h2>

                <div class="dash-grid">
                    <div>
                        <small>POTÊNCIA</small>
                        <strong>${stats.power} cv</strong>
                    </div>
                    <div>
                        <small>VELOCIDADE MÁXIMA ESTIMADA</small>
                        <strong>${stats.maxSpeed} km/h</strong>
                    </div>
                </div>

                <h3>PEÇAS E MELHORIAS</h3>

                ${upgrades.map(item => {
                    const isInstalled = installed.includes(item.id);

                    return `
                        <div class="upgrade-item">
                            <div>
                                <strong>${item.name}</strong>
                                <p>${item.description}</p>
                                <p>Potência adicional: ${item.power} cv</p>
                                <p>Preço: R$ ${item.price.toLocaleString("pt-BR")}</p>
                            </div>

                            <button class="card-btn"
                                data-upgrade="${item.id}"
                                ${isInstalled ? "disabled" : ""}>
                                ${isInstalled ? "INSTALADO" : "INSTALAR"}
                            </button>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }
}