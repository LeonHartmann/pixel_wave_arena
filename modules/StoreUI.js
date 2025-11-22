/**
 * StoreUI.js
 * Manages Store UI rendering and interactions
 */

import { Persistence } from './Persistence.js';
import { StoreRankManager } from './StoreRankManager.js';
import { StoreUpgradeTree, BRANCHES } from './StoreUpgradeTree.js';
import { StoreServices } from './StoreServices.js';
import { RotatingOffers } from './RotatingOffers.js';
import { CRATE_TYPES } from './Items.js';
import { GachaInterface } from './GachaInterface.js';
import { Assets } from './Assets.js';

export class StoreUI {
    constructor(showScreenFn, gachaInterface) {
        this.showScreen = showScreenFn;
        this.gachaInterface = gachaInterface;
        this.currentTab = 'rank';

        // Service state tracking
        this.selectedItemsForService = {
            reforge: null,
            fusion: [],
            promotion: { target: null, materials: [] }
        };

        this.initEvents();
    }

    initEvents() {
        // Tab switching
        document.getElementById('store-tab-rank').onclick = () => this.switchTab('rank');
        document.getElementById('store-tab-shop').onclick = () => this.switchTab('shop');
        document.getElementById('store-tab-services').onclick = () => this.switchTab('services');

        // Back button
        document.getElementById('store-back-btn').onclick = () => this.showScreen('menu');

        // Refresh deals button
        document.getElementById('refresh-deals-btn').onclick = () => this.refreshDeals();

        // Listen for rank up events
        window.addEventListener('storeRankUp', (e) => this.handleRankUp(e.detail));
    }

    open(tab = 'rank') {
        this.currentTab = tab;
        this.render();
    }

    switchTab(tab) {
        this.currentTab = tab;

        // Update tab buttons
        document.querySelectorAll('.store-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        if (tab === 'rank') document.getElementById('store-tab-rank').classList.add('active');
        if (tab === 'shop') document.getElementById('store-tab-shop').classList.add('active');
        if (tab === 'services') document.getElementById('store-tab-services').classList.add('active');

        // Update content visibility - properly manage both hidden and active classes
        document.querySelectorAll('.store-tab-content').forEach(content => {
            content.classList.remove('active');
            content.classList.add('hidden');
        });

        if (tab === 'rank') {
            const content = document.getElementById('store-rank-content');
            content.classList.add('active');
            content.classList.remove('hidden');
        }
        if (tab === 'shop') {
            const content = document.getElementById('store-shop-content');
            content.classList.add('active');
            content.classList.remove('hidden');
        }
        if (tab === 'services') {
            const content = document.getElementById('store-services-content');
            content.classList.add('active');
            content.classList.remove('hidden');
        }

        // Render current tab
        this.renderCurrentTab();
    }

    render() {
        this.updateCurrencyDisplays();
        this.switchTab(this.currentTab);
    }

    renderCurrentTab() {
        if (this.currentTab === 'rank') this.renderRankTab();
        if (this.currentTab === 'shop') this.renderShopTab();
        if (this.currentTab === 'services') this.renderServicesTab();
    }

    updateCurrencyDisplays() {
        const data = Persistence.getData();
        document.getElementById('store-gold-display').textContent = data.gold;
        document.getElementById('store-tokens-display').textContent = data.shopTokens;
    }

    // ==================
    // RANK & UPGRADES TAB
    // ==================

    renderRankTab() {
        const data = Persistence.getData();
        const rankDisplay = StoreRankManager.formatRankDisplay(data.storeXP, data.storeRank);

        // Update rank info
        document.getElementById('store-rank-title').textContent = `RANK ${rankDisplay.rank}`;
        document.getElementById('store-rank-name').textContent = rankDisplay.name;
        document.getElementById('rank-xp-text').textContent = rankDisplay.isMaxRank
            ? 'MAX RANK'
            : `${rankDisplay.currentXP} / ${rankDisplay.nextRankXP} XP`;

        // Update XP bar
        const xpFill = document.getElementById('rank-xp-fill');
        xpFill.style.width = `${rankDisplay.progress}%`;

        // Update upgrade points
        document.getElementById('upgrade-points-display').textContent = data.storeUpgradePoints;

        // Render upgrade tree
        this.renderUpgradeTree();
    }

    renderUpgradeTree() {
        const treeDisplay = StoreUpgradeTree.getUpgradeTreeDisplay();

        // Render each branch
        this.renderBranchNodes('economy-nodes', treeDisplay[BRANCHES.ECONOMY]);
        this.renderBranchNodes('loot-nodes', treeDisplay[BRANCHES.LOOT_QUALITY]);
        this.renderBranchNodes('services-nodes', treeDisplay[BRANCHES.SERVICES]);
    }

    renderBranchNodes(containerId, nodes) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        nodes.forEach(node => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'upgrade-node';

            if (!node.isUnlocked) nodeDiv.classList.add('locked');
            if (node.currentLevel === node.maxLevel) nodeDiv.classList.add('maxed');
            else if (node.currentLevel > 0) nodeDiv.classList.add('purchased');

            nodeDiv.innerHTML = `
                <div class="node-header">
                    <span class="node-name">${node.name}</span>
                    <span class="node-level">LV ${node.currentLevel}/${node.maxLevel}</span>
                </div>
                <div class="node-desc">${node.description}</div>
                ${node.nextEffect ? `<div class="node-effect">Next: ${node.nextEffect.desc}</div>` : ''}
                <div class="node-actions">
                    <span class="node-cost">${node.canPurchase ? `${node.pointCost} Point${node.pointCost > 1 ? 's' : ''}` : node.canPurchaseReason}</span>
                    <button class="node-btn" ${!node.canPurchase ? 'disabled' : ''}>
                        ${node.currentLevel === node.maxLevel ? 'MAXED' : 'UPGRADE'}
                    </button>
                </div>
            `;

            // Add click handler if can purchase
            if (node.canPurchase) {
                const btn = nodeDiv.querySelector('.node-btn');
                btn.onclick = () => this.purchaseUpgrade(node.id);
            }

            container.appendChild(nodeDiv);
        });
    }

    purchaseUpgrade(upgradeId) {
        const success = StoreUpgradeTree.purchaseUpgrade(upgradeId);
        if (success) {
            this.updateCurrencyDisplays();
            this.renderRankTab(); // Re-render to show changes
        }
    }

    // ==================
    // SHOP TAB
    // ==================

    renderShopTab() {
        this.renderCratesGrid();
        this.renderRotatingDeals();
    }

    renderCratesGrid() {
        const data = Persistence.getData();
        const grid = document.getElementById('store-crates-grid');
        grid.innerHTML = '';

        const crateEntries = Object.entries(CRATE_TYPES);

        crateEntries.forEach(([crateKey, crateData]) => {
            const isUnlocked = StoreRankManager.isCrateUnlocked(data.storeRank, crateKey);

            // Apply crate discount from upgrades
            const discount = StoreUpgradeTree.getCrateDiscount();
            const finalCost = Math.floor(crateData.cost * (1 - discount));

            // Determine crate icon
            let crateIconSrc = Assets.icons.chest_common;
            if (crateKey === 'BASIC_CRATE') crateIconSrc = Assets.icons.chest_common;
            else if (crateKey === 'SILVER_CRATE') crateIconSrc = Assets.icons.chest_rare;
            else if (crateKey === 'GOLD_CRATE') crateIconSrc = Assets.icons.chest_epic;
            else if (crateKey === 'LEGENDARY_CRATE') crateIconSrc = Assets.icons.chest_legendary;

            const card = document.createElement('div');
            card.className = 'crate-card';
            if (!isUnlocked) card.classList.add('locked');

            card.innerHTML = `
                <img src="${crateIconSrc}" class="crate-icon" alt="${crateKey}">
                <div class="crate-name">${crateKey.replace('_', ' ')}</div>
                <div class="crate-cost">${finalCost} GOLD</div>
                <div class="crate-info">
                    ${crateData.items} item${crateData.items > 1 ? 's' : ''}
                    ${!isUnlocked ? '<br>LOCKED' : ''}
                    ${isUnlocked && discount > 0 ? `<br>-${(discount * 100).toFixed(0)}% DISCOUNT` : ''}
                </div>
            `;

            if (isUnlocked) {
                card.onclick = () => this.purchaseCrate(crateKey, finalCost);
            }

            grid.appendChild(card);
        });
    }

    purchaseCrate(crateKey, cost) {
        const data = Persistence.getData();

        if (data.gold < cost) {
            alert('Not enough gold!');
            return;
        }

        // Deduct cost
        data.gold -= cost;
        Persistence.save();

        // Open crate via GachaInterface
        this.gachaInterface.openCrateUI(crateKey, () => {
            this.updateCurrencyDisplays();
        });
    }

    renderRotatingDeals() {
        // Initialize offers if needed
        RotatingOffers.init();

        const grid = document.getElementById('rotating-deals-grid');
        grid.innerHTML = '';

        const offers = RotatingOffers.getCurrentOffers();

        if (offers.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #aaa;">No deals available. Refresh to generate new offers!</p>';
            this.updateRefreshButton();
            return;
        }

        offers.forEach(offer => {
            const card = document.createElement('div');
            card.className = 'deal-card';

            const costText = offer.cost.gold ? `${offer.cost.gold} GOLD` : `${offer.cost.shopTokens} TOKENS`;

            card.innerHTML = `
                <div class="deal-name">${offer.name}</div>
                <div class="deal-desc">${offer.description}</div>
                <div class="deal-cost">${costText}</div>
                <button class="deal-btn">BUY</button>
            `;

            const btn = card.querySelector('.deal-btn');
            btn.onclick = () => this.purchaseOffer(offer.id);

            grid.appendChild(card);
        });

        this.updateRefreshButton();
    }

    updateRefreshButton() {
        const canRefresh = RotatingOffers.canRefresh();
        const costText = document.getElementById('refresh-cost-text');

        if (canRefresh.isFree) {
            costText.textContent = 'Free refresh available!';
        } else if (canRefresh.can) {
            costText.textContent = `50 gold OR 20 tokens to refresh`;
        } else {
            costText.textContent = 'Cannot afford refresh';
        }
    }

    refreshDeals() {
        const result = RotatingOffers.refreshOffers(false);

        if (result.success) {
            this.updateCurrencyDisplays();
            this.renderRotatingDeals();
        } else {
            alert(result.error);
        }
    }

    purchaseOffer(offerId) {
        const result = RotatingOffers.purchaseOffer(offerId);

        if (result.success) {
            this.updateCurrencyDisplays();
            this.renderRotatingDeals();
            alert(`Purchased! Check your inventory for rewards.`);
        } else {
            alert(result.error);
        }
    }

    // ==================
    // SERVICES TAB
    // ==================

    renderServicesTab() {
        this.renderServicePanel('REFORGE', 'reforge');
        this.renderServicePanel('FUSION', 'fusion');
        this.renderServicePanel('RARITY_PROMOTION', 'promotion');
    }

    renderServicePanel(serviceId, serviceName) {
        const info = StoreServices.getServiceInfo(serviceId);
        const infoDiv = document.getElementById(`${serviceName}-info`);
        const uiDiv = document.getElementById(`${serviceName}-ui`);

        if (!info.unlocked) {
            infoDiv.innerHTML = `<div class="service-locked">Service locked. Unlock via Upgrade Tree.</div>`;
            uiDiv.innerHTML = '';
            return;
        }

        // Render service-specific info
        if (serviceId === 'REFORGE') {
            infoDiv.innerHTML = `
                <p>Cost: ${info.cost} Gold</p>
                <p>Level ${info.level} ${info.hasDoubleRoll ? '(Double Roll Active)' : ''}</p>
            `;
            this.renderReforgeUI(uiDiv);
        } else if (serviceId === 'FUSION') {
            infoDiv.innerHTML = `<p>Level ${info.level}</p>`;
            this.renderFusionUI(uiDiv);
        } else if (serviceId === 'RARITY_PROMOTION') {
            infoDiv.innerHTML = `
                <p>Cost: ${info.cost} Gold</p>
                <p>Daily: ${info.usedToday}/${info.dailyLimit}</p>
                <p>Remaining: ${info.remainingUses}</p>
            `;
            this.renderPromotionUI(uiDiv);
        }
    }

    renderReforgeUI(container) {
        const data = Persistence.getData();
        const statGems = data.inventory.items.filter(i => i.category === 'STAT_GEM');

        container.innerHTML = '<div class="service-select" id="reforge-items"></div>';
        const grid = container.querySelector('#reforge-items');

        if (statGems.length === 0) {
            grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No stat gems available</p>';
            return;
        }

        statGems.forEach(gem => {
            const slot = document.createElement('div');
            slot.className = 'service-item-slot';
            if (this.selectedItemsForService.reforge === gem.uid) slot.classList.add('selected');

            slot.innerHTML = `
                <div>${gem.name}</div>
                <div style="font-size: 9px; color: #aaa;">${gem.desc}</div>
            `;

            slot.onclick = () => {
                this.selectedItemsForService.reforge = gem.uid;
                this.renderServicePanel('REFORGE', 'reforge');
            };

            grid.appendChild(slot);
        });

        // Add execute button
        const btn = document.createElement('button');
        btn.className = 'service-execute-btn';
        btn.textContent = 'REFORGE SELECTED';
        btn.disabled = !this.selectedItemsForService.reforge;
        btn.onclick = () => this.executeReforge();
        container.appendChild(btn);
    }

    executeReforge() {
        const result = StoreServices.reforgeItem(this.selectedItemsForService.reforge);

        if (result.success) {
            this.updateCurrencyDisplays();
            alert(`Reforged! Old stats: ${JSON.stringify(result.oldStats)}\nNew stats: ${JSON.stringify(result.newStats)}`);
            this.selectedItemsForService.reforge = null;
            this.renderServicePanel('REFORGE', 'reforge');
        } else {
            alert(result.error);
        }
    }

    renderFusionUI(container) {
        const data = Persistence.getData();

        container.innerHTML = `
            <p style="font-size: 10px; margin-bottom: 10px;">Select 3 items to fuse:</p>
            <div class="service-select" id="fusion-items"></div>
        `;
        const grid = container.querySelector('#fusion-items');

        data.inventory.items.forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'service-item-slot';
            if (this.selectedItemsForService.fusion.includes(item.uid)) slot.classList.add('selected');

            slot.innerHTML = `
                <div>${item.name}</div>
                <div style="font-size: 9px; color: #aaa;">${item.rarity}</div>
            `;

            slot.onclick = () => {
                const index = this.selectedItemsForService.fusion.indexOf(item.uid);
                if (index > -1) {
                    this.selectedItemsForService.fusion.splice(index, 1);
                } else if (this.selectedItemsForService.fusion.length < 3) {
                    this.selectedItemsForService.fusion.push(item.uid);
                }
                this.renderServicePanel('FUSION', 'fusion');
            };

            grid.appendChild(slot);
        });

        // Add execute button
        const btn = document.createElement('button');
        btn.className = 'service-execute-btn';
        btn.textContent = `FUSE (${this.selectedItemsForService.fusion.length}/3)`;
        btn.disabled = this.selectedItemsForService.fusion.length !== 3;
        btn.onclick = () => this.executeFusion();
        container.appendChild(btn);
    }

    executeFusion() {
        const result = StoreServices.fuseItems(this.selectedItemsForService.fusion);

        if (result.success) {
            alert(`Fusion successful! Created: ${result.result.name} (${result.result.rarity})`);
            this.selectedItemsForService.fusion = [];
            this.renderServicePanel('FUSION', 'fusion');
        } else {
            alert(result.error);
        }
    }

    renderPromotionUI(container) {
        const data = Persistence.getData();

        container.innerHTML = `
            <p style="font-size: 10px; margin-bottom: 10px;">Select target item:</p>
            <div class="service-select" id="promotion-target"></div>
            <p style="font-size: 10px; margin: 10px 0;">Select 3 material items:</p>
            <div class="service-select" id="promotion-materials"></div>
        `;

        const targetGrid = container.querySelector('#promotion-target');
        const materialsGrid = container.querySelector('#promotion-materials');

        // Render target items (exclude Mythic)
        const promotableItems = data.inventory.items.filter(i => i.rarity !== 'MYTHIC');
        promotableItems.forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'service-item-slot';
            if (this.selectedItemsForService.promotion.target === item.uid) slot.classList.add('selected');

            slot.innerHTML = `
                <div>${item.name}</div>
                <div style="font-size: 9px; color: #aaa;">${item.rarity}</div>
            `;

            slot.onclick = () => {
                this.selectedItemsForService.promotion.target = item.uid;
                this.renderServicePanel('RARITY_PROMOTION', 'promotion');
            };

            targetGrid.appendChild(slot);
        });

        // Render material items
        data.inventory.items.forEach(item => {
            if (item.uid === this.selectedItemsForService.promotion.target) return; // Can't use target as material

            const slot = document.createElement('div');
            slot.className = 'service-item-slot';
            if (this.selectedItemsForService.promotion.materials.includes(item.uid)) slot.classList.add('selected');

            slot.innerHTML = `
                <div>${item.name}</div>
                <div style="font-size: 9px; color: #aaa;">${item.rarity}</div>
            `;

            slot.onclick = () => {
                const index = this.selectedItemsForService.promotion.materials.indexOf(item.uid);
                if (index > -1) {
                    this.selectedItemsForService.promotion.materials.splice(index, 1);
                } else if (this.selectedItemsForService.promotion.materials.length < 3) {
                    this.selectedItemsForService.promotion.materials.push(item.uid);
                }
                this.renderServicePanel('RARITY_PROMOTION', 'promotion');
            };

            materialsGrid.appendChild(slot);
        });

        // Add execute button
        const btn = document.createElement('button');
        btn.className = 'service-execute-btn';
        btn.textContent = `PROMOTE (${this.selectedItemsForService.promotion.materials.length}/3 materials)`;
        btn.disabled = !this.selectedItemsForService.promotion.target || this.selectedItemsForService.promotion.materials.length !== 3;
        btn.onclick = () => this.executePromotion();
        container.appendChild(btn);
    }

    executePromotion() {
        const result = StoreServices.promoteRarity(
            this.selectedItemsForService.promotion.target,
            this.selectedItemsForService.promotion.materials
        );

        if (result.success) {
            alert(`Promotion successful! ${result.oldRarity} → ${result.newRarity}\nRemaining uses today: ${result.remainingUses}`);
            this.selectedItemsForService.promotion = { target: null, materials: [] };
            this.updateCurrencyDisplays();
            this.renderServicePanel('RARITY_PROMOTION', 'promotion');
        } else {
            alert(result.error);
        }
    }

    // ==================
    // EVENT HANDLERS
    // ==================

    handleRankUp(detail) {
        // Show notification
        alert(`STORE RANK UP!\n\nRank ${detail.newRank}: ${detail.rankName}\n+${detail.pointsAwarded} Upgrade Points\n\nUnlocked: ${detail.unlocks.map(u => u.name).join(', ') || 'None'}`);

        // Re-render if Store is open
        if (document.getElementById('store-layer').classList.contains('active')) {
            this.render();
        }
    }
}
