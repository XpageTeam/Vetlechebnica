<template>
    <div>
        <div class="main-content__calendar">
            <calendar v-model="selectedDate" type="inline" ></calendar>
        </div>
        <div class="main-content__table"  :class="{
            'ajax-processed' : $store.state.ajaxProcessed,
        }">
            <div class="desktop-table">
                <!-- <div class="desktop-table__head">
                    <table>
                      <thead>
                        <tr>
                          <th></th>
                          <th v-for="doctor in doctors">{{ doctor.name }}</th>
                        </tr>
                        <tr>
                          <th></th>
                          <th v-for="doctor in doctors">{{ doctor.position }}</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th v-for="doctor in doctors">{{ doctor.address }}</th>
                        </tr>
                      </thead>
                    </table>
                </div> -->
                <div class="main-grid-ear main-grid-ear--left"></div>
                <div class="desktop-table__main">
                    <table>
                        <thead class="desktop-table__head">
                            <tr>
                                <th></th>
                                <th v-for="doctor in doctors">{{ doctor.name }}</th>
                            </tr>
                            <tr>
                                <th></th>
                                <th v-for="doctor in doctors">{{ doctor.position }}</th>
                            </tr>
                            <tr>
                                <th></th>
                                <th v-for="doctor in doctors">{{ doctor.address }}</th>
                            </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in timeRows">
                          <td class="desktop-table__time">
                            <span>{{ row }}</span>
                          </td>
                          <td v-for="doctor in doctors" :class="{'desktop-table__time--on': checkRegByTime(row, doctor.new_free), 'desktop-table__time--off': !checkRegByTime(row, doctor.new_free)}">
                              <a class="registration-btn" v-if="checkRegByTime(row, doctor.new_free)" @click.prevent="registration(row, doctor.id)" href="#">Записаться</a>
                          </td>
                          <!-- <td class="desktop-table__time--on">
                            <div>Записаться</div>
                          </td>
                          <td class="desktop-table__time--off"></td> -->
                        </tr>
                      </tbody>
                    </table>
                </div>
                <div class="main-grid-ear main-grid-ear--right"></div>
            </div>
        </div>

        <registration @update="loadData" v-if="showModal || !canShowModal" :doctorID="selectedDoctorID" :time="selectedTime" :date="selectedDate " />
        <div v-if="$store.state.error" class="error__block">
            <div class="error">
                <div class="error__text">
                    <div class="text-page">
                        <p>При загрузке данных произошла ошибка.</p>
                        <p>Попробуйте ещё раз.</p>
                    </div>
                </div>
                <div class="error__btn">
                    <button @click.prevent="$store.commit('setSelectedDate'); reload()" class="btn btn--news">Повторить</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import moment from "moment"
    import _ from "lodash"

    import Store from './store.vue'

    window.store = Store

    export default {
        name : 'LoadGrid',
        props: {
            personalData: {
                type: String,
                default: ""
            }
        },
        data : () => ({
            selectedDate : Store.state.selectedDate,
            selectedDoctorID: "0",
            selectedTime: "00:00",
            showModal: false,
            canShowModal: true,
        }),
        mounted () {
            require("../jquery.fancybox.js")
            require("../jquery.fancybox.css")

            this.$store.state.personalDataText = this.personalData

            this.loadData()


            this.sameSizes()

            $(window).on("resize", this.sameSizes)

            $(window).on("load touchmove scroll", this.onScrollTable)


            if ($(window).width() > 660)
                this.canShowModal = true
            else
                this.canShowModal = false

            $(window).on("resize", e => {
                if ($(window).width() > 660 && !this.canShowModal){
                    this.canShowModal = true
                    this.$forceUpdate()
                }else if (this.canShowModal){
                    this.canShowModal = false
                    this.$forceUpdate()
                }
            })
        },
        updated(){
            this.sameSizes();

            ;(function(){
                const tableScroll = document.querySelector(".desktop-table__main"),
                    btns = { 
                        left: document.querySelector(".main-grid-ear--left"),
                        right: document.querySelector(".main-grid-ear--right")
                    };

                let interval;

                btns.right.addEventListener("mouseenter", function(e){
                    clearInterval(interval)

                    interval = setInterval(function(){
                        scrollLeft(5)
                    }, 15)
                })

                btns.right.addEventListener("mouseleave", function(){
                    clearInterval(interval)
                })

                btns.left.addEventListener("mouseleave", function(){
                    clearInterval(interval)
                })

                btns.left.addEventListener("mouseenter", function(e){
                    clearInterval(interval)

                    interval = setInterval(function(){
                        scrollLeft(-5)
                    }, 15)
                })

                 let left = btns.left,
                    right = btns.right;

                const scrollLeft = (scWidth = 0) => {
                    if (tableScroll.scrollLeft <= 0 && scWidth < 0){
                        left.classList.remove("show")

                        return
                    }

                    if (tableScroll.scrollLeft >= tableScroll.scrollWidth - tableScroll.clientWidth && scWidth > 0){
                        right.classList.remove("show")

                        return
                    }

                    tableScroll.scrollLeft = tableScroll.scrollLeft + scWidth

                    if (tableScroll.scrollLeft > 0)
                        left.classList.add("show")

                    if (tableScroll.scrollLeft < tableScroll.scrollWidth - tableScroll.clientWidth)
                        right.classList.add("show")
                };

                tableScroll.addEventListener("scroll", function(){
                    // left.style.top = -this.scrollTop + "px";
                    // right.style.top = -this.scrollTop + "px";

                    scrollLeft()
                })

                scrollLeft()

                $(window).resize(scrollLeft)

            })()
        },
        methods : {
            reload(){
                location.reload()
            },
            loadData (closePopup = true) {
                if (closePopup)
                    $.fancybox.close()

                this.$store.commit("loadData")                
            },
            sameSizes(){
                let widthSumm = 0;
                $(".desktop-table__main table tbody tr:first-child td").each((i, el) => {
                    const $this = $(el);

                    widthSumm += $this.outerWidth()
                    $(".desktop-table__head > table").width(widthSumm)

                    $(".desktop-table__head th:eq("+i+")").width($this.outerWidth() + 1)
                })
            },
            onScrollTable(){
               let mainTable = document.querySelector(".desktop-table__main"),
                    mainTableHead = document.querySelector(".desktop-table__head table")

                if (!mainTable || !mainTableHead)
                    return

                mainTable.addEventListener("scroll", e => {
                    mainTableHead.style.transform = "translateX(-"+mainTable.scrollLeft+"px)"

                    if (!mainTable.scrollTop)
                        $("body, html").trigger("focus")
                })
            },

            registration(time, doctorID){
                this.selectedTime = time
                this.selectedDoctorID = doctorID

                this.showModal = true
                const self = this;

                if (this.canShowModal)
                    setTimeout(_ => {
                        $.fancybox.open({
                            src: "#registration",
                            trapFocus: false,
                            touch: false,
                            afterClose(){
                                self.showModal = false
                            }
                        })
                    }, 10)
            },
            checkRegByTime(time, doctorTimeArray){
                return doctorTimeArray.filter(item => item == time).length ? true : false
            },
        },
        computed: {
            timeRows(){
                return this.$store.state.timeArray
            },
            doctors(){
                return this.$store.state.doctors
            }
        }
    }
</script>

<style lang="sass">
    .ajax-processed, .ajax-processed-popup
        position: relative

        &:after
            content: ""
            position: absolute
            top: 0
            left: 0
            width: 100%
            height: 100%
            z-index: 99
            background: url("../img/loading.svg") center no-repeat, rgba(255,255,255, .7)

    .desktop-table
        position: relative

        &:before, &:after
            content: ""
            position: absolute
            top: 0
            bottom: 0
            width: 1px
            background: #e4e8ea
            z-index: 15

        &:after
            right: 0

        &:before
            left: 0

        &__main
            max-height: calc(100vh - 200px)

            td
                cursor: default

                &:first-child
                    position: sticky
                    left: 0
                    z-index: 5
                    background: #fff

        &__head
            overflow-x: hidden
            position: sticky
            top: 0
            z-index: 10

            tr

                &:nth-child(3) th
                    font-size: 10px
                    text-align: center
                    height: auto
                    padding: 3px

            th
                background: #fff
                box-sizing: border-box

        &__time

            &--on, &--off
                display: table-cell !important
                text-align: center

    .calendar-select
        background-size: 10px auto

    .registration-btn
        padding: 10px 20px
        background: #fff
        border-radius: 30px
        color: #000
        text-decoration: none
    
    .popup-form
        border-radius: 15px
        background: #fff
        padding: 15px 30px 20px !important
        width: 1100px
        max-width: 100%
        display: none

        &__title
            font-size: 30px
            margin-bottom: 15px

            &--small
                margin-bottom: 15px
                font-size: 26px

        &__content
            max-height: calc(100vh - 12px - 5rem - 4.0625rem - 43px - 1.75rem)
            overflow: hidden
            // height: 100%

            &.has-scrollbar
                padding: 1rem 2rem 0 0
                overflow-y: auto
                border-top: 1px solid #e7e7e7

                &::-webkit-scrollbar
                    width: 4px
                    border-radius: 4px
                    background: #f3f3f3

                    &-thumb
                        border-radius: 4px
                        background: #31c5bd

    .fancybox-content
        max-height: calc(100% - 6px)

    .checkbox

        &__input

            &.forms__input--error 

                &:not(:focus) + label, &:not(:focus) + label a
                    color: red

                &:not(:valid)

                    ~ .forms__error-message
                        opacity: 1

            ~ .forms__error-message
                right: auto !important
                left: 0 !important

                &:after
                    right: auto !important
                    left: 15px !important

    .service

        form
            display: flex
            flex-wrap: wrap
            margin: 0 0 -35px -33px

        &__item
            width: calc((100% - 33px * 2) / 2)
            margin: 0 0 35px 33px

            &:last-child
                margin-bottom: 0 !important

            &--full, &--submit
                width: 100%

            &-content
                display: flex
                justify-content: space-between

            &-calendar, &-time
                width: calc((100% - 16px * 2) / 2)

            &-calendar
                overflow: hidden
                border-radius: 15px
                border: 1px solid #e7e7e7

            &-title
                margin-bottom: 15px
                font-size: 20px

                &:not(:first-child)
                    margin-top: 37px

            &--submit
                display: flex
                align-items: center

                > *

                    &:not(:last-child)
                        margin-right: 50px

        &__input
            border: none
            background: transparent
            flex: 1 1 auto
            padding: 0 0 0 24px

            &.forms__input--error

                &:not(:valid)
                    border-color: red

                    ~ .forms__error-message
                        opacity: 1

                &:focus

                    ~ .forms__error-message
                        opacity: 0

            &--select
                padding-right: 24px
                background: url("../img/ico-select-arrow-gray.png") right 2px center no-repeat

            &-cont
                display: flex
                flex-direction: row-reverse
                justify-content: flex-end
                border-radius: 13px
                position: relative
                border: 1px solid transparent

                &.js__have-error
                    border-color: red

                &:not(.service__input-cont--checkbox)
                    padding: 13px 18px

                &:not(.service__input-cont--white, .service__input-cont--checkbox)
                    background: #f3f3f3

                &:not(:first-child)
                    margin: 12px 0 0
                                                
                &--white
                    border: 1px solid #e7e7e7

                &--doctor
                    margin: 0 0 20px

                &--checkbox
                    padding: 10px 5px

                    .checkbox

                        &__label
                            color: rgba(38, 38, 38, .4)
                            flex-direction: row-reverse
                            display: flex
                            align-items: center

                            &:before
                                margin: 0 0 0 40px

                            &:after
                                left: auto
                                right: 9px

                .service__input-cont
                    padding: 0 !important
                    width: 100%

        &__label
            color: rgba(38, 38, 38, .4)
            border-right: 1px solid #d2d2d2
            min-width: 167px
            flex: none
            padding-right: 13px

        &__radio-group
            // display: flex
            // flex-wrap: wrap

    .car-select:not(:first-child)
        margin: 12px 0 0

    textarea.service__input
        min-height: 76px
        resize: none

    .service__radio

        &--disabled.service__radio--checked

            .service-radio__input

                + label
                    background: #212e7d !important
                    color: #fff !important

    .service-radio
        position: relative
        margin: 0 0 10px 10px
        // width: calc()
        display: inline-block

        &__input
            opacity: 0
            position: absolute
            top: 50%
            left: 50%

            &:matches(:disabled, :checked)

                ~ label
                    border-color: transparent

            &:disabled

                ~ label
                    background: #f3f3f3
                    cursor: default
                    color: rgba(38, 38, 38, .4)

            &:checked

                ~ label
                    background: #31c5bd
                    color: #fff

        &__label
            border-radius: 6px
            padding: 8px 11px 6px
            display: block
            white-space: nowrap
            border: 1px solid #e7e7e7
            cursor: pointer

    @supports (display: grid)
        .service__radio-group
            display: grid
            grid-gap: 14px

            &--time
                grid-template-columns: repeat(6,1fr)

            &--post
                grid-template-columns: repeat(5, 1fr)

        .service-radio
            margin: 0

            &__label
                display: inline-flex
                justify-content: center
                width: 100%

    @media screen and (max-width: 1100px)
        .service

            form
                margin: 0 0 -2rem -1rem

            &__item
                width: calc((100% - 1rem * 2) / 2)
                margin: 0 0 2rem 1rem

                &--full, &--submit
                    width: 100% 

    .forms
    
        &__error

            &-message
                border: 1px solid #d4d4d4 !important
                background: #fff !important
                color: #000 !important
                padding: 7px 10px !important
                border-radius: 7px !important
                position: absolute !important
                bottom: 45px !important
                right: -6px !important
                box-shadow: 0px 0px 21px 0px rgba(0, 0, 0, 0.1) !important
                transition: opacity .3s ease
                user-select: none
                font-size: 12px

                opacity: 0
                pointer-events: none
                display: block !important

                &:after
                    content: ""
                    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAIBAMAAADU/bjBAAAAGFBMVEX////V1dXV1dXY2Nji4uL9/f3+/v7///88REMWAAAAA3RSTlMAipDLFSdbAAAAM0lEQVQI12NwKweBMgcGlXQQI0WBgQkkVObEwAAWAgowgITAAiAhsABQyBUiwMAgLAAkAJ+wDc+KWF7qAAAAAElFTkSuQmCC) no-repeat !important
                    position: absolute !important
                    top: calc(100% - 0px) !important
                    right: 19px !important
                    height: 8px !important
                    width: 15px !important

                &-icon
                    display: block
                    border-radius: 50%
                    position: absolute
                    border: 1px solid #ff0024
                    height: 19px
                    width: 19px
                    background: #fff
                    bottom: -32px
                    right: 16px

                    &:before, &:after
                        content: ""
                        position: absolute
                        width: 1px
                        background: #ff0024
                        left: calc(50% - 1px)

                    &:before
                        top: 4px
                        height: 8px

                    &:after
                        bottom: 4px
                        height: 2px

    .main-grid-ear.show
        opacity: .6
    
    .main-grid-ear:hover
        opacity: .8
    
    .main-grid-ear
        top: 0
        height: 100%
        position: absolute
        z-index: 1
        width: 50px
        opacity: 0
        transition: opacity 200ms ease, margin 200ms ease, height 200ms ease
        -webkit-transform: translate3d(0px, 48px, 0)
        transform: translate3d(0px, 0, 0)
        will-change: transform

        &:not(.show)
            opacity: 0 !important
    

    .main-grid-ear--left.show
        margin-left: 0
    
    .main-grid-ear--left
        left: 90px
        margin-left: -50px
        background: url("../img/ico-left.svg") center left no-repeat

    .main-grid-ear--right.show
        margin-right: 0
    
    .main-grid-ear--right
        opacity: 0
        right: 0
        background: url("../img/ico-right.svg") center right no-repeat
        margin-right: -50px

    .registration
        position: relative

    .error

        &__block
            position: absolute
            top: 0
            right: 0
            bottom: 0
            left: 0
            background: rgba(0,0,0, .7)
            z-index: 20
            color: #fff
            display: flex
            align-items: center
            justify-content: center

        &__text
            font-size: 18px

            .text-page

                > *

                    &:not(:first-child)
                        margin-top: 15px

        &__btn
            margin-top: 20px
    
    @media screen and (max-width: 1000px)
        .service

            &__item

                &--full

                    .service__item-content
                        display: block
                        margin-left: 0

                &-calendar, &-time
                    margin-left: 0
                    width: 100%

                    &:not(:first-child)
                        margin-top: 10px

    @media screen and (max-width: 660px)
        .service__item-inputs
            margin-left: 0 !important
            display: block !important

        .service

            form
                margin: 0 

            &__input
                width: 100% !important
                padding-left: 0 !important

                &-cont
                    margin-left: 0 !important
                    width: 100% !important
                    flex-direction: column-reverse
                    position: relative

                    &:empty
                        display: none
                    

            &__label
                border: none
                margin-bottom: 7px
                font-size: 15px
                position: absolute
                pointer-events: none
                display: none

            &__item
                margin-left: 0

                &-checkbox
                    text-align: center
                    margin: 0  !important

                &--submit
                    position: static !important
                    flex-direction: column
                    align-items: center



                    .default-btn
                        margin: 15px 0 0 !important

        .popup-form
            // padding: 15px !important
            max-height: none !important
            overflow: visible !important

            &:not(&--message)
                padding: 0 !important

            &--message
                padding: 15px !important

            &__content
                overflow: visible !important
                max-height: none !important

        .main-content

            &__calendar, &__table
                display: none

    @media screen and (max-width: 400px)
        .service__radio-group--time
            grid-template-columns: repeat(4, 1fr)
</style>