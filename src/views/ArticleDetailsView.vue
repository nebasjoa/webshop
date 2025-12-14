<template>
    <div class="article-details-wrapper">
        <div class="article-details-content">
            <div class="details-left">
                <div class="article-photo">
                    <img :src="article.photo" alt="">
                </div>
            </div>
            <div class="details-right">
                <div class="article-title">{{ article.title }}</div>
                <div>{{ article.price }}</div>
                <div class="cart-button"><button @click="store.isMiniCart = true">Add to cart</button></div>
            </div>
        </div>
    </div>
</template>

<script>
import { useWebshopStore } from '@/stores/webshopStore.js';
import dummyPhoto from '@/assets/files/images/camera.jpg'
export default {
    data() {
        return {
            store: useWebshopStore(),
            article: {
                id: '1',
                title: 'Dummy article',
                price: '€ 5,00',
                photo: dummyPhoto
            },
            isAdded: false,
        }
    }

}
</script>

<style scoped>
.article-details-wrapper {
    width: 100%;
    display: flex;
    position: relative;
}

.article-details-content {
    width: 100%;
    max-width: var(--main-width);
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 20px;
    margin: auto;
    margin-top: 20px;
}

.details-left {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.details-right {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.article-title {
    font-size: 24px;
}

.cart-button button {
    width: 100%;
    border: none;
    padding: 10px;
    background-color: var(--charcoal);
    color: white;
    font-size: 16px;
    cursor: pointer;
}
</style>