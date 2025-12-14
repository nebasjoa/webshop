<template>
    <div class="navbar-wrapper">
        <div class="navbar-content">
            <div class="nav-content-left"><a href="/">Home</a></div>
            <div class="nav-content-mid"><a href="/">WEBSHOP</a></div>
            <div class="nav-content-right">
                <div>Profile</div>
                <div>Einkaufswagen</div>
            </div>
        </div>
        <transition name="slide-right">
        <div class="mini-cart" v-if="store.isMiniCart">
            <div>
            <div class="close-mini-cart"><span class="close-button" @click="store.isMiniCart = false">Close</span></div>
            <div class="mini-article">
                <div class="mini-article-left">
                    <img :src="store.article.photo" alt="">
                </div>
                <div class="mini-article-right">
                    <div>
                    <div>{{ store.article.title }}</div>
                    <div>{{ store.article.price }}</div>
                    </div>
                    <div class="remove-from-cart"><span>Remove</span></div>
                </div>
            </div>
            </div>
            <div>
                <div class="total-price"><span>Total price: </span><span>{{ store.article.price }}</span></div>
                <div class="buttons-wrapper">
                    <span class="view-cart-span" @click="routeTo('cart')">View Cart</span>
                    <button class="checkout-button" @click="routeTo('checkout')">Go to chekout</button>
                </div>
            </div>
        </div>
        </transition>
    </div>
</template>

<script>
import { useWebshopStore } from '@/stores/webshopStore.js';
export default {
    data() {
        return {
            store: useWebshopStore(),
        }
    },
    methods: {
        routeTo(location) {
            this.$router.push(location)
            this.store.isMiniCart = false
        }
    }
}
</script>

<style scoped>
.navbar-wrapper {
    width: 100%;
    display: flex;
    background-color: white;
    color: var(--charcoal);
    background-color: var(--darker-green);
    position: relative;
}

.navbar-content {
    width: 100%;
    max-width: var(--main-width);
    display: grid;
    grid-template-columns: 1fr 4fr 1fr;
    background-color: var(--darker-green);
    margin: auto;
    padding: 10px 0;
}

.mini-cart {
    position: absolute;
    width: 300px;
    top: 0;
    right: 0;
    background-color: red;
    min-height: 100vh;
    z-index: 9;
    background-color: white;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-left: 1px solid;
    border-color: var(--cool-gray);
    justify-content: space-between;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.close-mini-cart {
    width: 100%;
    display: flex;
    justify-content: end;
    margin-bottom: 10px;
}

.close-button {
    cursor: pointer;
}

.close-button:hover {

    text-decoration: underline;
}

.mini-article {
    width: 100%;
    display: flex;
    gap: 10px;
}

.mini-article-left {
    width: 50%;
}

.mini-article-left img {
    overflow: hidden;
    width: 100%;
}

.mini-article-right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.remove-from-cart {
    font-size: 14px;
    cursor: pointer;
}

.remove-from-cart span:hover {
    text-decoration: underline;
}

a {
    text-decoration: none;
    color: white;
}

.nav-content-left {
    display: flex;
    align-items: center;
}

.nav-content-mid {
    font-size: 24px;
    color: white;
    text-align: center;
}

.nav-content-right {
    display: flex;
    color: white;
    gap: 10px;
    align-items: center;
}

.total-price {
    font-size: 1.5rem;
}

.buttons-wrapper {
    margin-top: 10px;
    margin-bottom: 10px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
}

.checkout-button {
    border: none;
    background-color: var(--charcoal);
    color: white;
    padding: 10px 15px;
    cursor: pointer;
    font-size: 16px;
}

.view-cart-span {
    font-size: 14px;
}

.view-cart-span:hover {
    text-decoration: underline;
    cursor: pointer;
}
</style>