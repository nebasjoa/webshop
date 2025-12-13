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
    </div>
</template>

<script></script>

<style scoped>
.navbar-wrapper {
    width: 100%;
    display: flex;
    background-color: white;
    color: var(--charcoal);
    background-color: var(--darker-green);
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
</style>