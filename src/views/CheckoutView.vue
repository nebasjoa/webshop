<template>
    <div class="checkout-wrapper">
        <div class="checkout-content">

        </div>
    </div>
</template>

<script>
import { useWebshopStore } from '@/stores/webshopStore.js';
import dummyPhoto from '@/assets/files/images/camera.jpg'
export default {
    data() {
        return {
            article: {
                id: '1',
                title: 'Dummy article',
                price: '€ 5,00',
                photo: dummyPhoto
            }
        }
    }

}
</script>

<style scoped>
.checkout-wrapper {
    width: 100%;
    display: flex;
}

.checkout-content {
    width: 100%;
    max-width: var(--main-width);
    margin: auto;
    margin-top: 20px;
    display: flex;
}

</style>