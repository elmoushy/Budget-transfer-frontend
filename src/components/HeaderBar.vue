<!-- HeaderBar.vue -->
<template>
  <header class="header" :class="{ 'dark-theme': isDarkMode }">
    <!-- logo + title -->
    <div class="left logo-container">
      <div class="logo-wrapper">
        <svg
          class="company-logo"
          xmlns="http://www.w3.org/2000/svg"
          width="65"
          height="43"
          viewBox="0 0 65 43"
          fill="none"
        >
          <g clip-path="url(#clip0_3_246)">
            <path
              d="M17.4673 20.7389C17.7337 2.33838 40.8995 3.3546 42.4485 18.9235C45.5958 13.3491 45.0828 12.1355 45.0828 12.1355C40.9982 0.148073 17.635 -2.15076 13.3827 15.3717C-5.46181 17.0982 -3.28138 41.6158 13.3827 42.0696C28.3695 42.4742 49.641 31.0195 52.4331 7.41948H54.7615L51.269 -0.0196533L45.9412 7.32082L47.7664 7.41948C46.9179 23.4126 30.2934 38.7743 12.8696 37.4523C-0.943102 36.4163 2.89489 15.7466 17.4673 20.7389Z"
              fill="#0D66B0"
            />
            <path
              d="M47.4113 41.7834H25.6562C26.8303 41.596 29.4449 40.7968 34.9009 37.5804H47.0068C49.3944 37.5804 58.9154 30.309 49.0393 22.7811L51.0125 18.7754C51.5498 19.0392 52.0704 19.3358 52.5713 19.6634V22.7811C52.5713 23.4771 52.8478 24.1446 53.34 24.6368C53.8321 25.129 54.4997 25.4055 55.1958 25.4055H57.169C59.6849 32.6473 54.4459 41.7736 47.3619 41.7736"
              fill="#EA7A08"
            />
            <path
              d="M59.1028 24.1427H55.1564C54.7987 24.1401 54.4564 23.9969 54.2035 23.7439C53.9505 23.491 53.8073 23.1487 53.8047 22.791V18.7656C53.8073 18.4079 53.9505 18.0656 54.2035 17.8127C54.4564 17.5597 54.7987 17.4165 55.1564 17.4139H59.1028C59.4596 17.4165 59.8009 17.5601 60.0523 17.8133C60.3036 18.0665 60.4446 18.4088 60.4446 18.7656V22.8404C60.4446 23.1971 60.3036 23.5395 60.0523 23.7927C59.8009 24.0459 59.4596 24.1894 59.1028 24.192"
              fill="#6AC1D2"
            />
            <path
              d="M63.2861 17.187H61.451C61.2565 17.1844 61.0708 17.1053 60.9341 16.9668C60.7975 16.8283 60.7209 16.6415 60.7209 16.447V14.3554C60.7209 14.2595 60.7398 14.1645 60.7765 14.076C60.8132 13.9874 60.8669 13.9069 60.9347 13.8391C61.0025 13.7713 61.083 13.7175 61.1716 13.6808C61.2602 13.6441 61.3552 13.6252 61.451 13.6252H63.2861C63.4807 13.6252 63.6675 13.7018 63.8059 13.8385C63.9444 13.9751 64.0235 14.1608 64.0261 14.3554V16.447C64.0236 16.6424 63.9448 16.8292 63.8066 16.9674C63.6683 17.1056 63.4816 17.1844 63.2861 17.187Z"
              fill="#EF7B23"
            />
            <path
              d="M59.4184 13.2799H58.3628C58.2555 13.2799 58.1526 13.2373 58.0768 13.1614C58.0009 13.0856 57.9583 12.9827 57.9583 12.8754V11.6717C57.9583 11.5644 58.0009 11.4616 58.0768 11.3857C58.1526 11.3098 58.2555 11.2672 58.3628 11.2672H59.4184C59.5257 11.2672 59.6286 11.3098 59.7045 11.3857C59.7803 11.4616 59.823 11.5644 59.823 11.6717V12.8458C59.823 12.9531 59.7803 13.056 59.7045 13.1318C59.6286 13.2077 59.5257 13.2503 59.4184 13.2503"
              fill="#0D66B0"
            />
            <path d="M36.9827 26.2342L32.0496 30.3781V12.6583H36.9827V26.2342Z" fill="#2B2523" />
            <path d="M30.2243 31.4338L25.301 33.8214V17.4435H30.2243V31.4338Z" fill="#0C7533" />
            <path d="M23.4758 34.4134L18.5427 35.627V22.5049H23.4758V34.4134Z" fill="#E52727" />
          </g>
          <defs>
            <clipPath id="clip0_3_246">
              <rect
                width="63.9726"
                height="42.0992"
                fill="white"
                transform="translate(0.0534668)"
              />
            </clipPath>
          </defs>
        </svg>
        <svg
          class="company-text-logo"
          xmlns="http://www.w3.org/2000/svg"
          width="62"
          height="9"
          viewBox="0 0 62 9"
          fill="none"
        >
          <g clip-path="url(#clip0_3_256)">
            <path
              d="M2.50794 7.08169H5.2568V8.50521H0.777588V0.270874H2.47109L2.50794 7.08169Z"
              fill="#0D66B0"
            />
            <path d="M8.57023 0.246338V8.50521H6.91357V0.270868L8.57023 0.246338Z" fill="#0D66B0" />
            <path
              d="M14.7184 3.86652H18.8294C18.8294 4.01378 18.8294 4.16104 18.8294 4.3083C18.8434 4.87247 18.7418 5.43352 18.5307 5.95692C18.3197 6.48031 18.0036 6.95497 17.6023 7.35168C17.2092 7.7545 16.7369 8.07151 16.2152 8.28272C15.6936 8.49393 15.1338 8.59476 14.5712 8.57886C13.8475 8.58452 13.1342 8.40723 12.4973 8.06345C11.8477 7.72603 11.3072 7.2111 10.9388 6.57856C10.5359 5.89494 10.3279 5.11402 10.3375 4.32056C10.3264 3.75126 10.4292 3.18549 10.6399 2.65651C10.8507 2.12754 11.1651 1.64604 11.5647 1.24037C11.9526 0.840962 12.4186 0.525833 12.9338 0.314686C13.449 0.10354 14.0022 0.000911376 14.5589 0.0131924C15.2029 0.00863527 15.84 0.146946 16.4242 0.418162C17.0049 0.705463 17.5095 1.12595 17.8968 1.64533L16.6696 2.65161C16.4862 2.42221 16.2715 2.2198 16.0316 2.0503C15.6242 1.76986 15.1393 1.62394 14.6449 1.63305C14.1069 1.62415 13.5807 1.79231 13.1476 2.11165C12.7762 2.40133 12.4918 2.7877 12.3255 3.22838C12.1781 3.58644 12.1029 3.97015 12.1045 4.35738C12.091 4.74783 12.1644 5.13643 12.3194 5.49508C12.4743 5.85374 12.7068 6.1735 13.0004 6.4313C13.458 6.85351 14.059 7.086 14.6816 7.0817C15.1724 7.07917 15.6511 6.92957 16.056 6.6522C16.2926 6.50673 16.4972 6.31467 16.6573 6.0877C16.8247 5.81823 16.949 5.52426 17.0255 5.21641H14.7307L14.7184 3.86652Z"
              fill="#0D66B0"
            />
            <path
              d="M22.2899 5.10594V8.50521H20.5964V0.270874H22.2899V3.74378H25.4069V0.270874H27.1004V8.50521H25.4069V5.13049L22.2899 5.10594Z"
              fill="#0D66B0"
            />
            <path
              d="M32.1443 1.63303V8.50521H30.4508V1.63303H28.4995V0.246338H34.0955V1.63303H32.1443Z"
              fill="#0D66B0"
            />
            <path d="M37.1756 0.246338V8.50521H35.4944V0.270868L37.1756 0.246338Z" fill="#EA7A08" />
            <path
              d="M39.3967 8.50523V0.270889H41.7284C42.496 0.239946 43.2604 0.386954 43.9618 0.700407C44.6463 1.03954 45.1988 1.59635 45.5326 2.28345C45.8407 2.90907 45.9963 3.59875 45.9866 4.29603C45.9949 5.16108 45.7612 6.01121 45.3118 6.75038C44.9398 7.32448 44.4195 7.78726 43.806 8.08972C43.1924 8.39217 42.5084 8.52303 41.8265 8.46842L39.3967 8.50523ZM41.0902 1.64534V7.10625H41.4093C41.7894 7.11623 42.1692 7.07495 42.5384 6.98353C42.8325 6.88569 43.1067 6.73608 43.3482 6.54174C43.6572 6.26862 43.9005 5.92918 44.0599 5.5488C44.2193 5.16842 44.2906 4.75694 44.2686 4.34511C44.2772 3.7962 44.1418 3.25462 43.8759 2.77433C43.6362 2.3616 43.2645 2.04168 42.8206 1.86622C42.4675 1.7165 42.0873 1.64131 41.7038 1.64534H41.0902Z"
              fill="#EA7A08"
            />
            <path
              d="M49.3981 1.63304V3.65788H52.3188V5.03231H49.435V7.09397H52.3188V8.50521H47.7415V0.270874H52.3188V1.65759L49.3981 1.63304Z"
              fill="#EA7A08"
            />
            <path
              d="M58.958 7.05715H55.7918L55.3011 8.48066H53.5461L56.3931 0.246338H58.4548L61.2528 8.48066H59.3998L58.958 7.05715ZM58.5163 5.67044L57.3749 2.27117L56.2214 5.67044H58.5163Z"
              fill="#EA7A08"
            />
          </g>
          <defs>
            <clipPath id="clip0_3_256">
              <rect
                width="60.4505"
                height="8.54113"
                fill="white"
                transform="translate(0.814453 0.0991211)"
              />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>

    <!-- middle section with animated tanfeez logo -->
    <div class="middle">
      <div
        class="animated-brand"
        role="img"
        aria-label="Tanfeez logo (emblem + animated wordmark)"
        tabindex="0"
        @click="toggleAnimatedLogo"
        @focus="isLogoFocused = true"
        @blur="isLogoFocused = false"
        :class="{ active: isLogoActive, focused: isLogoFocused }"
      >
        <!-- SMALL EMBLEM (always visible) -->
        <svg
          class="brand-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="53"
          height="38"
          viewBox="0 0 53 38"
          fill="none"
          aria-hidden="true"
        >
          <g clip-path="url(#clip0_3_134)">
            <g filter="url(#filter0_i_3_134)">
              <path
                d="M30.2305 16.9277C28.7331 14.7117 27.0531 12.6229 25.2077 10.6828C24.523 9.96567 25.1796 8.88993 26.2535 8.9691L36.3975 9.72351C37.3354 9.79802 37.8419 10.7527 37.2604 11.4093L32.2424 17.0488C32.1096 17.1861 31.9483 17.2932 31.7698 17.3625C31.5912 17.4318 31.3996 17.4618 31.2082 17.4502C31.0168 17.4387 30.8303 17.386 30.6614 17.2958C30.4926 17.2056 30.3455 17.08 30.2305 16.9277Z"
                fill="#DADADA"
              />
            </g>
            <path
              d="M21.5779 17.7147V37.9954H28.228V25.3706C27.3838 23.3169 24.0635 19.6659 21.5779 17.7147Z"
              fill="#2E2827"
            />
            <path
              d="M52.7835 0H3.02515L0.783447 4.59632C11.5699 6.92475 22.7503 11.7819 29.1049 23.5637C27.2618 16.9882 19.7113 7.45098 14.2618 4.69412L47.1417 5.92819L52.7835 0Z"
              fill="#E52727"
            />
          </g>
          <defs>
            <filter
              id="filter0_i_3_134"
              x="24.9277"
              y="8.96497"
              width="12.5801"
              height="12.4877"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="2" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3_134" />
            </filter>
            <clipPath id="clip0_3_134">
              <rect width="52" height="38" fill="white" transform="translate(0.783447)" />
            </clipPath>
          </defs>
        </svg>

        <!-- FULL WORDMARK (revealed part-by-part on hover/focus/tap) -->
        <svg
          class="brand-wordmark"
          xmlns="http://www.w3.org/2000/svg"
          width="147"
          height="36"
          viewBox="0 0 147 36"
          fill="none"
          aria-hidden="true"
          style="transform: translateX(-15px)"
        >
          <g clip-path="url(#clip0_3_138)">
            <!-- Add pathLength="1" and classes seg-1..seg-6 for staggered timing -->
            <path
              class="seg seg-1"
              pathLength="1"
              d="M20.4834 11.2346H25.5221V35.3582H20.46L20.0522 32.5293C19.1616 33.5714 18.0727 34.4204 16.8509 35.0254C15.5689 35.6432 14.1641 35.9539 12.7449 35.9335C10.6347 35.9465 8.56293 35.3602 6.76414 34.2409C4.9386 33.1282 3.43242 31.5496 2.39572 29.6625C0.777971 26.7696 0.330249 23.3528 1.14685 20.1318C1.96346 16.9108 3.98065 14.137 6.77351 12.3946C8.56998 11.2784 10.6383 10.6938 12.7449 10.7068C14.1835 10.683 15.6081 10.997 16.9071 11.6244C18.138 12.2358 19.2311 13.0985 20.1178 14.1585L20.4834 11.2346ZM16.6915 29.4533C17.7262 28.8603 18.5818 27.9924 19.1663 26.943C19.7795 25.8466 20.0934 24.6043 20.0756 23.3439C20.0914 22.0748 19.7778 20.8237 19.1663 19.7163C18.5802 18.6644 17.7253 17.7922 16.6915 17.1918C15.6468 16.5661 14.455 16.2376 13.2418 16.2409C12.0482 16.2414 10.8771 16.57 9.85297 17.1918C8.83211 17.8018 7.99312 18.6807 7.42503 19.7354C6.84344 20.851 6.53941 22.0938 6.53941 23.3558C6.53941 24.6178 6.84344 25.8606 7.42503 26.9762C7.9884 28.0226 8.82524 28.8912 9.84359 29.4865C10.8934 30.0772 12.0741 30.3872 13.2746 30.3872C14.4751 30.3872 15.6558 30.0772 16.7056 29.4865L16.6915 29.4533Z"
              fill="#2E2827"
            />
            <path
              class="seg seg-2"
              pathLength="1"
              d="M50.0172 11.9619C51.4389 12.7895 52.5822 14.032 53.2982 15.5277C54.1078 17.2713 54.5043 19.1827 54.4559 21.1093V35.3724H48.6439V22.122C48.6439 20.2203 48.1861 18.7464 47.2705 17.7005C46.786 17.1714 46.1925 16.757 45.5323 16.4866C44.8721 16.2163 44.1614 16.0967 43.4505 16.1363C42.4119 16.1261 41.3894 16.3969 40.4882 16.9207C39.6067 17.424 38.8712 18.1536 38.3556 19.0364C37.8324 19.9273 37.5616 20.9472 37.5728 21.9841V35.3581H31.7842V11.2345H36.7526L37.1416 14.3629C38.0888 13.2201 39.284 12.3154 40.6335 11.7195C42.0107 11.0617 43.5126 10.7161 45.0348 10.7068C46.7758 10.6707 48.4951 11.1039 50.0172 11.9619Z"
              fill="#2E2827"
            />
            <path
              class="seg seg-3"
              pathLength="1"
              d="M60.4743 35.3582V16.6212H57.3433V11.2108H60.4743V8.24406C60.4743 2.74802 63.4772 0 69.483 0C70.0267 0 70.3923 0 70.5704 0H71.2969V5.20127C70.5095 5.17274 69.9892 5.15848 69.7314 5.15848C68.5346 5.15848 67.6566 5.47543 67.0972 6.10935C66.5394 6.74168 66.2582 7.68304 66.2582 8.96197V11.2393H71.2313V16.6212H66.277V35.3582H60.4743Z"
              fill="#2E2827"
            />
            <path
              class="seg seg-4"
              pathLength="1"
              d="M78.6229 25.2742C78.9315 26.878 79.7961 28.3167 81.0603 29.3296C82.3317 30.3179 83.8976 30.8362 85.499 30.7987C87.593 30.8391 89.6203 30.0514 91.1517 28.6022L93.9171 32.6767C92.7754 33.7381 91.448 34.5734 90.0033 35.1394C88.4556 35.7345 86.8119 36.0311 85.1568 36.0142C82.9516 36.0395 80.782 35.4491 78.8854 34.3074C77.0403 33.2059 75.5228 31.619 74.4936 29.7147C73.4326 27.7754 72.8852 25.5903 72.9046 23.3724C72.8806 21.1551 73.3941 18.9657 74.3998 16.9968C75.3614 15.1261 76.8005 13.5515 78.5667 12.4374C80.3602 11.3063 82.4358 10.7205 84.5475 10.7496C86.7545 10.691 88.9355 11.2432 90.8564 12.3471C92.603 13.388 94.0071 14.9297 94.892 16.7781C96.0903 19.4339 96.5241 22.3791 96.1435 25.2742H78.6229ZM80.8681 17.1394C79.747 18.0754 78.9721 19.3693 78.6698 20.8098H90.697C90.4402 19.3799 89.7172 18.0789 88.6441 17.1157C87.5492 16.2253 86.1748 15.7645 84.7725 15.8177C83.3588 15.7824 81.9775 16.25 80.8681 17.1394Z"
              fill="#2E2827"
            />
            <path
              class="seg seg-5"
              pathLength="1"
              d="M105.218 25.2742C105.528 26.8786 106.394 28.3173 107.66 29.3297C108.93 30.3169 110.494 30.8352 112.094 30.7988C114.188 30.8392 116.215 30.0514 117.747 28.6023L120.517 32.6768C119.373 33.7383 118.044 34.5736 116.598 35.1395C115.052 35.7345 113.41 36.0312 111.756 36.0143C109.547 36.0405 107.372 35.4501 105.471 34.3075C103.626 33.2059 102.108 31.6191 101.079 29.7148C100.021 27.7745 99.4772 25.5895 99.4995 23.3725C99.4771 21.1548 99.9922 18.9654 100.999 16.9969C101.959 15.1265 103.397 13.5519 105.162 12.4375C106.955 11.3068 109.031 10.7211 111.142 10.7497C113.349 10.6906 115.531 11.2428 117.451 12.3471C119.199 13.3878 120.605 14.9294 121.492 16.7782C122.686 19.435 123.118 22.3796 122.738 25.2742H105.218ZM107.468 17.1395C106.345 18.075 105.569 19.3689 105.265 20.8099H117.292C117.039 19.3785 116.315 18.0763 115.239 17.1157C114.144 16.2249 112.77 15.7641 111.367 15.8178C109.955 15.7824 108.575 16.25 107.468 17.1395Z"
              fill="#2E2827"
            />
            <path
              class="seg seg-6"
              pathLength="1"
              d="M141.946 35.3582H125.78V31.355L137.648 16.4358H126.141V11.2061H145.204V15.1189L133.289 30.1522H146.783L141.946 35.3582Z"
              fill="#2E2827"
            />
          </g>
          <defs>
            <clipPath id="clip0_3_138">
              <rect width="146" height="36" fill="white" transform="translate(0.783447)" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div class="logo-glow-effect"></div>
    </div>

    <!-- action icons -->
    <div class="actions">
      <!-- Language Toggle -->
      <div class="toggle-container">
        <span class="toggle-label">{{ isArabic ? 'EN' : 'AR' }}</span>
        <label class="switch">
          <input type="checkbox" v-model="isArabic" @change="toggleLanguage" />
          <span class="slider"></span>
        </label>
      </div>

      <!-- Dark Mode Toggle -->
      <div class="toggle-container">
        <span class="toggle-label">{{ isDarkMode ? '☀️' : '🌙' }}</span>
        <label class="switch">
          <input type="checkbox" v-model="isDarkMode" @change="toggleDarkMode" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="notification-container">
        <button ref="notificationButtonRef" class="icon bell" @click="toggleNotifications">
          <BellIcon />
          <span v-if="hasUnreadNotifications" class="badge"></span>
          <span v-if="newNotificationToast" class="notification-toast">
            {{ isArabic ? 'لديك إشعارات جديدة' : 'You have new notifications' }}
          </span>
        </button>
      </div>
      <!-- Logout Button -->
      <button class="icon logout" @click="logout">
        <LogOutIcon />
      </button>
    </div>
  </header>

  <!-- Portal the notifications panel to body to avoid z-index issues -->
  <Teleport to="body">
    <NotificationsPanel
      v-if="showNotifications"
      :is-active="showNotifications"
      :notification-button-ref="notificationButtonRef"
      @close="showNotifications = false"
      @update:hasUnread="updateNotificationStatus"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { BellIcon, LogOutIcon } from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import NotificationsPanel from './NotificationsPanel.vue'
import notificationService from '@/services/NotificationService'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const router = useRouter()

const isDarkMode = ref(false)
const isArabic = ref(false)
const notificationButtonRef = ref<HTMLElement | null>(null)

// Animated logo state
const isLogoActive = ref(false)
const isLogoFocused = ref(false)

// Notifications
const showNotifications = ref(false)
const hasUnreadNotifications = ref(false)
const newNotificationToast = ref(false)
let notificationPolling: number | null = null
let toastTimeout: number | null = null
// Log screen resolution
// console.log('Screen Resolution:', {
//   width: window.screen.width,
//   height: window.screen.height,
//   availWidth: window.screen.availWidth,
//   availHeight: window.screen.availHeight,
//   devicePixelRatio: window.devicePixelRatio,
//   viewport: {
//     width: window.innerWidth,
//     height: window.innerHeight,
//   },
// })
onMounted(() => {
  isDarkMode.value = themeStore.darkMode
  isArabic.value = themeStore.language === 'ar'

  // Initialize notification status
  checkNotificationStatus()

  // Set up polling for notifications when not viewing the panel
  notificationPolling = window.setInterval(() => {
    if (!showNotifications.value) {
      checkNotificationStatus()
    }
  }, 30000) // Check every 30 seconds
})

onUnmounted(() => {
  if (notificationPolling) {
    clearInterval(notificationPolling)
  }
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
})

function toggleDarkMode() {
  themeStore.setDarkMode(isDarkMode.value)
}

function toggleLanguage() {
  themeStore.setLanguage(isArabic.value ? 'ar' : 'en')
}

async function logout() {
  await authStore.logout()
  router.push({ name: 'Login' })
}

// Check for new notifications
async function checkNotificationStatus() {
  if (!authStore.isAuthenticated) return

  try {
    const response = await notificationService.checkSystemNotifications()
    const newStatus = response.Number_Of_Notifications > 0

    // If we're getting new notifications and didn't have any before, show the toast
    if (newStatus && !hasUnreadNotifications.value) {
      showNewNotificationToast()
    }

    hasUnreadNotifications.value = newStatus
  } catch (error) {
    console.error('Error checking notification status:', error)
  }
}

// Show the notification toast for 5 seconds
function showNewNotificationToast() {
  newNotificationToast.value = true

  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }

  toastTimeout = window.setTimeout(() => {
    newNotificationToast.value = false
  }, 5000)
}

// Update notification status from child component
function updateNotificationStatus(status: boolean) {
  hasUnreadNotifications.value = status
}

// Toggle notifications panel
function toggleNotifications() {
  showNotifications.value = !showNotifications.value

  // If opening the panel, hide toast
  if (showNotifications.value) {
    newNotificationToast.value = false
  }
}

// Toggle animated logo for touch devices
function toggleAnimatedLogo() {
  isLogoActive.value = !isLogoActive.value
}
</script>

<style scoped>
.header {
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 44px;
  background: linear-gradient(135deg, #fff6fa 0%, #f8f6f8 25%, #e4c9d6 60%, #8a2a44 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #1a1423;
  box-shadow:
    0 8px 32px rgba(138, 42, 68, 0.15),
    0 4px 16px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 2px 8px rgba(138, 42, 68, 0.05);
  position: sticky;
  top: 0;
  z-index: 150;
  border-bottom: 1px solid rgba(228, 201, 214, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.08), transparent);
  animation: header-shimmer 4s infinite;
  z-index: 1;
}

.header.dark-theme {
  background: linear-gradient(135deg, #241726 0%, #18131a 25%, #51203c 60%, #6d1a36 100%);
  color: #f8e9f0;
  box-shadow:
    0 8px 32px rgba(167, 56, 92, 0.25),
    0 4px 16px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.15),
    0 2px 8px rgba(167, 56, 92, 0.1);
  border-bottom: 1px solid rgba(81, 32, 60, 0.4);
}

.header.dark-theme::before {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.15), transparent);
}

/* <-- clean left block --> */
.left {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  padding: 12px 20px;
  border-radius: 16px;
  background: rgba(255, 246, 250, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(228, 201, 214, 0.2);
  box-shadow:
    0 4px 16px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  z-index: 2;
}

/* Prevent RTL effects on logo container */
.logo-container {
  direction: ltr !important;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

/* Company logo styles with modern animations */
.company-logo {
  width: 65px;
  height: 43px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 4px 12px rgba(138, 42, 68, 0.2));
  animation: logo-float 6s ease-in-out infinite;
  transform-origin: center;
}

.company-text-logo {
  width: 62px;
  height: 9px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 8px rgba(138, 42, 68, 0.15));
  animation: text-logo-pulse 4s ease-in-out infinite;
  animation-delay: 0.5s;
}

.logo-wrapper:hover .company-logo {
  transform: scale(1.1) rotateY(10deg);
  filter: drop-shadow(0 8px 20px rgba(225, 75, 106, 0.4));
  animation-play-state: paused;
}

.logo-wrapper:hover .company-text-logo {
  transform: scale(1.05) translateX(5px);
  filter: drop-shadow(0 4px 12px rgba(225, 75, 106, 0.3));
  animation-play-state: paused;
}

.header.dark-theme .left {
  background: rgba(36, 23, 38, 0.4);
  border: 1px solid rgba(81, 32, 60, 0.3);
  box-shadow:
    0 4px 16px rgba(167, 56, 92, 0.12),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.left:hover {
  background: rgba(255, 246, 250, 0.5);
  border-color: rgba(225, 75, 106, 0.3);
  box-shadow:
    0 6px 20px rgba(138, 42, 68, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.header.dark-theme .left:hover {
  background: rgba(36, 23, 38, 0.6);
  border-color: rgba(225, 75, 106, 0.4);
  box-shadow:
    0 6px 20px rgba(167, 56, 92, 0.18),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

/* Logo with light effect */
.logo-img {
  width: 36px;
  height: auto;
  filter: drop-shadow(0 0 8px rgba(138, 42, 68, 0.2));
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
}

.logo-img:hover {
  transform: scale(1.08) rotate(2deg);
  filter: drop-shadow(0 0 12px rgba(225, 75, 106, 0.4));
}

.header.dark-theme .logo-img {
  filter: drop-shadow(0 0 8px rgba(167, 56, 92, 0.3));
}

.header.dark-theme .logo-img:hover {
  filter: drop-shadow(0 0 12px rgba(225, 75, 106, 0.6));
}

.logo-text {
  font-weight: 700;
  font-size: 22px;
  background: linear-gradient(135deg, #6d1a36, #8a2a44, #e14b6a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
  position: relative;
  text-shadow: 0 0 20px rgba(138, 42, 68, 0.3);
}

/* --- right block --- */
.actions {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;
  position: relative;
  z-index: 2;
}

.icon {
  background: rgba(255, 246, 250, 0.4);
  border: 1px solid rgba(228, 201, 214, 0.3);
  color: #1a1423;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
    0 2px 8px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.header.dark-theme .icon {
  background: rgba(36, 23, 38, 0.6);
  border: 1px solid rgba(81, 32, 60, 0.4);
  color: #f8e9f0;
  box-shadow:
    0 2px 8px rgba(167, 56, 92, 0.12),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.icon::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.1), transparent);
  border-radius: 12px;
  transform: scale(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}

.header.dark-theme .icon::before {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), transparent);
}

.icon:hover::before {
  transform: scale(1);
}

.icon:hover {
  transform: translateY(-3px);
  color: #6d1a36;
  border-color: #e14b6a;
  box-shadow:
    0 6px 20px rgba(138, 42, 68, 0.2),
    0 2px 8px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.header.dark-theme .icon:hover {
  color: #f8e9f0;
  border-color: #e14b6a;
  box-shadow:
    0 6px 20px rgba(167, 56, 92, 0.3),
    0 2px 8px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

.icon:active {
  transform: translateY(-1px) scale(0.95);
}

.notification-container {
  position: relative;
}

.bell {
  position: relative;
}

.badge {
  position: absolute;
  right: 2px;
  top: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  box-shadow:
    0 0 12px rgba(225, 75, 106, 0.6),
    0 0 6px rgba(138, 42, 68, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: pulse-notification 2s infinite;
  z-index: 1;
  border: 2px solid rgba(255, 246, 250, 0.8);
}

.header.dark-theme .badge {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
  box-shadow:
    0 0 12px rgba(225, 75, 106, 0.8),
    0 0 6px rgba(167, 56, 92, 0.6),
    inset 0 1px 0 rgba(248, 233, 240, 0.2);
  border: 2px solid rgba(36, 23, 38, 0.8);
}

.notification-toast {
  position: absolute;
  top: 50px;
  right: -30px;
  background: linear-gradient(135deg, #6d1a36, #8a2a44);
  color: #f8e9f0;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 12px;
  box-shadow:
    0 8px 24px rgba(138, 42, 68, 0.3),
    0 4px 12px rgba(138, 42, 68, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  white-space: nowrap;
  pointer-events: none;
  z-index: 400;
  animation: toast-slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(225, 75, 106, 0.3);
}

.header.dark-theme .notification-toast {
  background: linear-gradient(135deg, #a7385c, #6d1a36);
  box-shadow:
    0 8px 24px rgba(167, 56, 92, 0.4),
    0 4px 12px rgba(167, 56, 92, 0.3),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
  border: 1px solid rgba(225, 75, 106, 0.4);
}

.notification-toast::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 36px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #6d1a36;
  filter: drop-shadow(0 -2px 4px rgba(138, 42, 68, 0.2));
}

.header.dark-theme .notification-toast::before {
  border-bottom: 8px solid #a7385c;
  filter: drop-shadow(0 -2px 4px rgba(167, 56, 92, 0.3));
}

[dir='rtl'] .notification-toast {
  right: auto;
  left: -30px;
}

[dir='rtl'] .notification-toast::before {
  right: auto;
  left: 36px;
}

/* Prevent RTL effects on logos and critical UI elements */
[dir='rtl'] .logo-container,
[dir='rtl'] .logo-wrapper,
[dir='rtl'] .animated-brand,
[dir='rtl'] .brand-icon,
[dir='rtl'] .brand-wordmark,
[dir='rtl'] .company-logo,
[dir='rtl'] .company-text-logo {
  direction: ltr !important;
  transform: scaleX(1) !important;
}

[dir='rtl'] .middle {
  direction: ltr !important;
}

.logout {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.1), rgba(138, 42, 68, 0.05));
  color: #6d1a36;
  border: 1px solid rgba(225, 75, 106, 0.3);
  box-shadow:
    0 2px 8px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.logout::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.1), transparent);
  transition: left 0.5s ease-in-out;
}

.logout:hover {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), rgba(138, 42, 68, 0.1));
  border-color: #e14b6a;
  box-shadow:
    0 6px 20px rgba(138, 42, 68, 0.2),
    0 2px 8px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

.logout:hover::after {
  left: 0;
}

.header.dark-theme .logout {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.15), rgba(167, 56, 92, 0.1));
  color: #f8e9f0;
  border: 1px solid rgba(225, 75, 106, 0.4);
  box-shadow:
    0 2px 8px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.header.dark-theme .logout::after {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.2), transparent);
}

.header.dark-theme .logout:hover {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.25), rgba(167, 56, 92, 0.15));
  border-color: #e14b6a;
  box-shadow:
    0 6px 20px rgba(167, 56, 92, 0.3),
    0 2px 8px rgba(167, 56, 92, 0.2),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

/* Toggle switches */
.toggle-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255, 246, 250, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(228, 201, 214, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 2px 8px rgba(138, 42, 68, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.header.dark-theme .toggle-container {
  background: rgba(36, 23, 38, 0.4);
  border: 1px solid rgba(81, 32, 60, 0.3);
  box-shadow:
    0 2px 8px rgba(167, 56, 92, 0.08),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.toggle-container:hover {
  background: rgba(255, 246, 250, 0.5);
  border-color: rgba(225, 75, 106, 0.3);
  transform: translateY(-1px);
  box-shadow:
    0 4px 12px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.header.dark-theme .toggle-container:hover {
  background: rgba(36, 23, 38, 0.6);
  border-color: rgba(225, 75, 106, 0.4);
  box-shadow:
    0 4px 12px rgba(167, 56, 92, 0.12),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

.toggle-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: #6d1a36;
  transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 1px 2px rgba(138, 42, 68, 0.1);
}

.header.dark-theme .toggle-label {
  color: #c8a9b4;
  text-shadow: 0 1px 2px rgba(167, 56, 92, 0.2);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(228, 201, 214, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 26px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(228, 201, 214, 0.2);
  overflow: hidden;
  box-shadow:
    inset 0 2px 4px rgba(138, 42, 68, 0.1),
    0 1px 3px rgba(138, 42, 68, 0.05);
}

.header.dark-theme .slider {
  background: rgba(81, 32, 60, 0.4);
  border: 1px solid rgba(81, 32, 60, 0.3);
  box-shadow:
    inset 0 2px 4px rgba(167, 56, 92, 0.15),
    0 1px 3px rgba(167, 56, 92, 0.08);
}

.slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 2px;
  background: linear-gradient(135deg, #fff6fa, #f8f6f8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow:
    0 3px 8px rgba(138, 42, 68, 0.2),
    0 1px 3px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  z-index: 2;
  border: 1px solid rgba(228, 201, 214, 0.2);
}

.header.dark-theme .slider:before {
  background: linear-gradient(135deg, #51203c, #241726);
  box-shadow:
    0 3px 8px rgba(167, 56, 92, 0.3),
    0 1px 3px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.2);
  border: 1px solid rgba(81, 32, 60, 0.3);
}

.slider::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.1));
  transform: translateX(-100%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.header.dark-theme .slider::after {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.2));
}

input:checked + .slider {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  border-color: #e14b6a;
  box-shadow:
    inset 0 2px 4px rgba(109, 26, 54, 0.3),
    0 0 12px rgba(225, 75, 106, 0.3);
}

.header.dark-theme input:checked + .slider {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
  box-shadow:
    inset 0 2px 4px rgba(109, 26, 54, 0.4),
    0 0 12px rgba(225, 75, 106, 0.4);
}

input:checked + .slider::after {
  transform: translateX(0);
}

input:focus + .slider {
  box-shadow:
    0 0 4px rgba(225, 75, 106, 0.5),
    0 0 0 2px rgba(225, 75, 106, 0.2),
    inset 0 2px 4px rgba(138, 42, 68, 0.1);
}

input:checked + .slider:before {
  transform: translateX(24px);
  background: linear-gradient(135deg, #fff6fa, #f8f6f8);
  box-shadow:
    0 4px 12px rgba(225, 75, 106, 0.4),
    0 2px 6px rgba(225, 75, 106, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(225, 75, 106, 0.3);
}

.header.dark-theme input:checked + .slider:before {
  background: linear-gradient(135deg, #f8e9f0, #c8a9b4);
  box-shadow:
    0 4px 12px rgba(225, 75, 106, 0.5),
    0 2px 6px rgba(225, 75, 106, 0.3),
    inset 0 1px 0 rgba(248, 233, 240, 0.4);
  border: 1px solid rgba(225, 75, 106, 0.4);
}

@keyframes pulse-notification {
  0% {
    box-shadow:
      0 0 12px rgba(225, 75, 106, 0.6),
      0 0 6px rgba(138, 42, 68, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow:
      0 0 20px rgba(225, 75, 106, 0.8),
      0 0 10px rgba(138, 42, 68, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    transform: scale(1.1);
  }
  100% {
    box-shadow:
      0 0 12px rgba(225, 75, 106, 0.6),
      0 0 6px rgba(138, 42, 68, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

@keyframes header-shimmer {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes toast-slide-in {
  0% {
    opacity: 0;
    transform: translateY(-15px) scale(0.9);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modern Logo Animations */
@keyframes logo-float {
  0%,
  100% {
    transform: translateY(0px);
  }
  25% {
    transform: translateY(-3px) rotate(1deg);
  }
  50% {
    transform: translateY(-1px);
  }
  75% {
    transform: translateY(-2px) rotate(-0.5deg);
  }
}

@keyframes text-logo-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.username {
  font-size: 0.9rem;
  font-weight: 600;
  padding-right: 18px;
  border-right: 1px solid rgba(228, 201, 214, 0.3);
  margin-right: 18px;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  color: #6d1a36;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px 18px 8px 0;
  background: rgba(255, 246, 250, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.header.dark-theme .username {
  color: #c8a9b4;
  border-right: 1px solid rgba(81, 32, 60, 0.4);
  background: rgba(36, 23, 38, 0.3);
}

.username::before {
  content: '';
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  border-radius: 50%;
  box-shadow:
    0 0 12px rgba(225, 75, 106, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  display: inline-block;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: pulse-glow-username 3s ease-in-out infinite;
}

.header.dark-theme .username::before {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
  box-shadow:
    0 0 12px rgba(225, 75, 106, 0.6),
    inset 0 1px 0 rgba(248, 233, 240, 0.2);
}

.username:hover {
  color: #8a2a44;
  background: rgba(255, 246, 250, 0.4);
  transform: translateY(-1px);
}

.header.dark-theme .username:hover {
  color: #f8e9f0;
  background: rgba(36, 23, 38, 0.5);
}

[dir='rtl'] .username {
  padding-right: 0;
  padding-left: 18px;
  border-right: none;
  border-left: 1px solid rgba(228, 201, 214, 0.3);
  margin-right: 0;
  margin-left: 18px;
}

[dir='rtl'] .header.dark-theme .username {
  border-left: 1px solid rgba(81, 32, 60, 0.4);
}

@keyframes pulse-glow-username {
  0% {
    box-shadow:
      0 0 12px rgba(225, 75, 106, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow:
      0 0 18px rgba(225, 75, 106, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    transform: scale(1.1);
  }
  100% {
    box-shadow:
      0 0 12px rgba(225, 75, 106, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

/* Enhanced interactivity and smooth transitions */
.header *,
.header *::before,
.header *::after {
  transition-property: color, background-color, border-color, box-shadow, transform, opacity;
  transition-duration: 0.4s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states for accessibility */
.icon:focus-visible,
.toggle-container:focus-within {
  outline: 2px solid rgba(225, 75, 106, 0.5);
  outline-offset: 2px;
  border-radius: 12px;
}

/* Middle section with animated tanfeez logo - Enhanced Glassmorphism */
.middle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 20px;
  background: rgba(255, 246, 250, 0.15);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(138, 42, 68, 0.12),
    0 4px 16px rgba(225, 75, 106, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(138, 42, 68, 0.05);
  z-index: 2;
  overflow: hidden;
  /* Prevent RTL effects */
  direction: ltr !important;
  /* Continuous morphing animation */
  animation: glassmorphism-pulse 8s ease-in-out infinite;
}

.middle::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    transparent,
    rgba(225, 75, 106, 0.1),
    transparent,
    rgba(138, 42, 68, 0.08),
    transparent,
    rgba(225, 75, 106, 0.06),
    transparent
  );
  animation: glassmorphism-rotate 12s linear infinite;
  border-radius: 20px;
  z-index: -1;
}

.middle::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: glassmorphism-shimmer 6s ease-in-out infinite;
  border-radius: 20px;
}

.animated-brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  user-select: none;
  color: #2e2827;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  border-radius: 12px;
  padding: 8px 12px;
  transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  /* Prevent RTL effects */
  direction: ltr !important;
  /* Continuous floating animation */
  animation: brand-float-continuous 10s ease-in-out infinite;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 4px 12px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.animated-brand::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    rgba(225, 75, 106, 0.3),
    rgba(138, 42, 68, 0.2),
    rgba(225, 75, 106, 0.3),
    rgba(138, 42, 68, 0.2)
  );
  border-radius: 14px;
  opacity: 0;
  z-index: -1;
  animation: brand-glow-pulse 8s ease-in-out infinite;
  filter: blur(8px);
}

.animated-brand:focus {
  outline: 2px solid rgba(225, 75, 106, 0.5);
  outline-offset: 2px;
}

/* Small emblem (always visible) with enhanced animation */
.brand-icon {
  width: 53px;
  height: 38px;
  filter: drop-shadow(0 4px 8px rgba(138, 42, 68, 0.2));
  transition:
    transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 600ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform, filter;
  /* Enhanced continuous floating animation */
  animation:
    icon-float-3d 8s ease-in-out infinite,
    icon-glow-breathing 6s ease-in-out infinite;
  animation-delay: 0s, 1s;
}

/* Enhanced gentle idle float with 3D effects */
@keyframes icon-float-3d {
  0%,
  100% {
    transform: translateY(0px) rotateX(0deg) rotateY(0deg);
  }
  25% {
    transform: translateY(-4px) rotateX(2deg) rotateY(-1deg);
  }
  50% {
    transform: translateY(-2px) rotateX(-1deg) rotateY(2deg);
  }
  75% {
    transform: translateY(-3px) rotateX(1deg) rotateY(-0.5deg);
  }
}

@keyframes icon-glow-breathing {
  0%,
  100% {
    filter: drop-shadow(0 4px 8px rgba(138, 42, 68, 0.2)) drop-shadow(0 0 0px rgba(225, 75, 106, 0));
  }
  50% {
    filter: drop-shadow(0 6px 12px rgba(138, 42, 68, 0.3))
      drop-shadow(0 0 20px rgba(225, 75, 106, 0.4));
  }
}

/* Wordmark container with enhanced animations */
.brand-wordmark {
  width: 146px;
  height: 36px;
  overflow: visible;
  filter: drop-shadow(0 2px 6px rgba(138, 42, 68, 0.15));
  transition: all 600ms cubic-bezier(0.2, 0.8, 0.2, 1);
  /* Continuous subtle animation */
  animation: wordmark-subtle-wave 12s ease-in-out infinite;
}

@keyframes wordmark-subtle-wave {
  0%,
  100% {
    transform: translateX(-15px) scale(1);
    filter: drop-shadow(0 2px 6px rgba(138, 42, 68, 0.15));
  }
  25% {
    transform: translateX(-14px) scale(1.01);
    filter: drop-shadow(0 3px 8px rgba(138, 42, 68, 0.2));
  }
  50% {
    transform: translateX(-13px) scale(1.02);
    filter: drop-shadow(0 4px 10px rgba(225, 75, 106, 0.25));
  }
  75% {
    transform: translateX(-14px) scale(1.01);
    filter: drop-shadow(0 3px 8px rgba(138, 42, 68, 0.2));
  }
}

/* Each segment (path) with typewriter animation */
.brand-wordmark .seg {
  fill: currentColor !important;
  stroke: currentColor;
  stroke-width: 0.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  transform-origin: center;
  /* SVG stroke animation properties */
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  /* Typewriter animation */
  animation: typewriter-draw-erase 12s ease-in-out infinite;
}

/* Staggered typewriter animation for segments */
.seg-1 {
  animation-delay: 0s;
}
.seg-2 {
  animation-delay: 0.8s;
}
.seg-3 {
  animation-delay: 1.6s;
}
.seg-4 {
  animation-delay: 2.4s;
}
.seg-5 {
  animation-delay: 3.2s;
}
.seg-6 {
  animation-delay: 4s;
}

/* Typewriter effect: draw letter by letter, then erase */
@keyframes typewriter-draw-erase {
  0% {
    stroke-dashoffset: 1;
    opacity: 0;
    fill-opacity: 0;
  }

  /* Drawing phase - letter appears */
  8% {
    stroke-dashoffset: 0;
    opacity: 1;
    fill-opacity: 0;
  }

  /* Fill appears after stroke is complete */
  12% {
    stroke-dashoffset: 0;
    opacity: 1;
    fill-opacity: 1;
  }

  /* Hold visible state */
  70% {
    stroke-dashoffset: 0;
    opacity: 1;
    fill-opacity: 1;
  }

  /* Erasing phase - letter disappears */
  78% {
    stroke-dashoffset: 0;
    opacity: 1;
    fill-opacity: 0;
  }

  85% {
    stroke-dashoffset: 1;
    opacity: 0;
    fill-opacity: 0;
  }

  /* Stay invisible until next cycle */
  100% {
    stroke-dashoffset: 1;
    opacity: 0;
    fill-opacity: 0;
  }
}

/* Enhanced glassmorphism animation keyframes */
@keyframes glassmorphism-pulse {
  0%,
  100% {
    background: rgba(255, 246, 250, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow:
      0 8px 32px rgba(138, 42, 68, 0.12),
      0 4px 16px rgba(225, 75, 106, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      inset 0 -1px 0 rgba(138, 42, 68, 0.05);
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    background: rgba(255, 246, 250, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow:
      0 12px 40px rgba(138, 42, 68, 0.18),
      0 6px 20px rgba(225, 75, 106, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      inset 0 -1px 0 rgba(138, 42, 68, 0.08);
    transform: translate(-50%, -50%) scale(1.02);
  }
}

@keyframes glassmorphism-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes glassmorphism-shimmer {
  0%,
  100% {
    left: -100%;
    opacity: 0;
  }
  50% {
    left: 0%;
    opacity: 1;
  }
}

@keyframes brand-float-continuous {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-2px) rotate(0.5deg);
  }
  50% {
    transform: translateY(-1px) rotate(0deg);
  }
  75% {
    transform: translateY(-3px) rotate(-0.3deg);
  }
}

@keyframes brand-glow-pulse {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

/* Enhanced hover states that work with continuous animations */
.animated-brand:hover .brand-icon,
.animated-brand:focus-visible .brand-icon,
.animated-brand.active .brand-icon,
.animated-brand.focused .brand-icon {
  animation-play-state: paused;
  transform: translateX(-3px) rotate(2deg) scale(1.08) rotateY(5deg);
  filter: drop-shadow(0 8px 16px rgba(138, 42, 68, 0.3))
    drop-shadow(0 0 25px rgba(225, 75, 106, 0.6)) saturate(1.2);
}

.animated-brand:hover .brand-wordmark,
.animated-brand:focus-visible .brand-wordmark,
.animated-brand.active .brand-wordmark,
.animated-brand.focused .brand-wordmark {
  animation-play-state: paused;
  transform: translateX(-10px) scale(1.05);
  filter: drop-shadow(0 6px 16px rgba(138, 42, 68, 0.25))
    drop-shadow(0 0 20px rgba(225, 75, 106, 0.3));
}

/* Enhanced hover effect for segments with typewriter */
.animated-brand:hover .seg,
.animated-brand:focus-visible .seg,
.animated-brand.active .seg,
.animated-brand.focused .seg {
  /* Speed up the animation on hover for interactive effect */
  animation-duration: 6s;
  filter: drop-shadow(0 0 12px rgba(225, 75, 106, 0.8));
  stroke-width: 1;
}

/* Hover effect for the container */
.animated-brand:hover,
.animated-brand:focus-visible,
.animated-brand.active,
.animated-brand.focused {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 8px 24px rgba(138, 42, 68, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 0 30px rgba(225, 75, 106, 0.3);
  animation-play-state: paused;
  transform: translateY(-1px) scale(1.02);
}

/* Dark theme adjustments for enhanced glassmorphism */
.header.dark-theme .middle {
  background: rgba(36, 23, 38, 0.2);
  border: 1px solid rgba(81, 32, 60, 0.4);
  box-shadow:
    0 8px 32px rgba(167, 56, 92, 0.18),
    0 4px 16px rgba(225, 75, 106, 0.12),
    inset 0 1px 0 rgba(248, 233, 240, 0.3),
    inset 0 -1px 0 rgba(167, 56, 92, 0.08);
  /* Dark theme specific glassmorphism pulse */
  animation: glassmorphism-pulse-dark 8s ease-in-out infinite;
}

.header.dark-theme .middle::before {
  background: conic-gradient(
    from 0deg,
    transparent,
    rgba(225, 75, 106, 0.15),
    transparent,
    rgba(167, 56, 92, 0.12),
    transparent,
    rgba(225, 75, 106, 0.1),
    transparent
  );
}

.header.dark-theme .middle::after {
  background: linear-gradient(90deg, transparent, rgba(248, 233, 240, 0.2), transparent);
}

.header.dark-theme .animated-brand {
  color: #f8e9f0;
  background: rgba(248, 233, 240, 0.1);
  border: 1px solid rgba(248, 233, 240, 0.2);
  box-shadow:
    0 4px 12px rgba(167, 56, 92, 0.12),
    inset 0 1px 0 rgba(248, 233, 240, 0.2);
}

.header.dark-theme .animated-brand::before {
  background: linear-gradient(
    45deg,
    rgba(225, 75, 106, 0.4),
    rgba(167, 56, 92, 0.3),
    rgba(225, 75, 106, 0.4),
    rgba(167, 56, 92, 0.3)
  );
}

.header.dark-theme .brand-icon {
  filter: drop-shadow(0 4px 8px rgba(225, 75, 106, 0.25));
}

.header.dark-theme .animated-brand:hover .brand-icon,
.header.dark-theme .animated-brand:focus-visible .brand-icon,
.header.dark-theme .animated-brand.active .brand-icon,
.header.dark-theme .animated-brand.focused .brand-icon {
  filter: drop-shadow(0 8px 16px rgba(225, 75, 106, 0.4))
    drop-shadow(0 0 30px rgba(225, 75, 106, 0.7)) saturate(1.3);
}

.header.dark-theme .animated-brand:hover .brand-wordmark,
.header.dark-theme .animated-brand:focus-visible .brand-wordmark,
.header.dark-theme .animated-brand.active .brand-wordmark,
.header.dark-theme .animated-brand.focused .brand-wordmark {
  filter: drop-shadow(0 6px 16px rgba(225, 75, 106, 0.3))
    drop-shadow(0 0 25px rgba(225, 75, 106, 0.4));
}

/* Enhanced glow effect for better glassmorphism */
.logo-glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  background: radial-gradient(
    circle,
    rgba(225, 75, 106, 0.15) 0%,
    rgba(138, 42, 68, 0.1) 30%,
    transparent 70%
  );
  border-radius: 50%;
  opacity: 0.6;
  animation: enhanced-glow-pulse 6s ease-in-out infinite;
  z-index: -1;
  filter: blur(8px);
}

@keyframes enhanced-glow-pulse {
  0%,
  100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

/* Reduced motion: Respect user preferences but keep some subtle effects */
@media (prefers-reduced-motion: reduce) {
  .middle,
  .animated-brand,
  .brand-icon,
  .brand-wordmark,
  .brand-wordmark .seg,
  .logo-glow-effect {
    animation-duration: 0.1s;
    animation-iteration-count: 1;
  }

  .middle::before,
  .middle::after {
    animation: none;
  }

  /* Show all segments statically for users who prefer reduced motion */
  .brand-wordmark .seg {
    opacity: 1;
    fill-opacity: 1;
    stroke-dashoffset: 0;
    animation: none;
    filter: drop-shadow(0 0 8px rgba(225, 75, 106, 0.6));
    transition: all 0.3s ease;
  }

  .animated-brand:hover .seg,
  .animated-brand:focus-visible .seg,
  .animated-brand.active .seg,
  .animated-brand.focused .seg {
    opacity: 1;
    filter: drop-shadow(0 0 8px rgba(225, 75, 106, 0.6));
    animation: none;
    transition: all 0.3s ease;
  }
}

/* Dark theme glassmorphism animation */
@keyframes glassmorphism-pulse-dark {
  0%,
  100% {
    background: rgba(36, 23, 38, 0.2);
    border: 1px solid rgba(81, 32, 60, 0.4);
    box-shadow:
      0 8px 32px rgba(167, 56, 92, 0.18),
      0 4px 16px rgba(225, 75, 106, 0.12),
      inset 0 1px 0 rgba(248, 233, 240, 0.3),
      inset 0 -1px 0 rgba(167, 56, 92, 0.08);
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    background: rgba(36, 23, 38, 0.35);
    border: 1px solid rgba(81, 32, 60, 0.6);
    box-shadow:
      0 12px 40px rgba(167, 56, 92, 0.25),
      0 6px 20px rgba(225, 75, 106, 0.18),
      inset 0 1px 0 rgba(248, 233, 240, 0.4),
      inset 0 -1px 0 rgba(167, 56, 92, 0.12);
    transform: translate(-50%, -50%) scale(1.02);
  }
}

.header.dark-theme .logo-glow-effect {
  background: radial-gradient(
    circle,
    rgba(225, 75, 106, 0.25) 0%,
    rgba(167, 56, 92, 0.15) 30%,
    transparent 70%
  );
  opacity: 0.8;
}

.middle:hover {
  background: rgba(255, 246, 250, 0.35);
  border-color: rgba(225, 75, 106, 0.4);
  box-shadow:
    0 12px 32px rgba(138, 42, 68, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 0 40px rgba(225, 75, 106, 0.2);
  transform: translate(-50%, -50%) translateY(-3px) scale(1.03);
  animation-play-state: paused;
}

.header.dark-theme .middle:hover {
  background: rgba(36, 23, 38, 0.5);
  border-color: rgba(225, 75, 106, 0.5);
  box-shadow:
    0 12px 32px rgba(167, 56, 92, 0.25),
    inset 0 1px 0 rgba(248, 233, 240, 0.4),
    0 0 40px rgba(225, 75, 106, 0.3);
  animation-play-state: paused;
}

.middle:hover .logo-glow-effect {
  opacity: 1;
  animation-duration: 2s;
  transform: translate(-50%, -50%) scale(1.4);
}

/* Responsive adjustments for smaller screens */
@media (max-width: 1200px) {
  .brand-icon {
    width: 48px;
    height: 34px;
  }

  .brand-wordmark {
    width: 130px;
    height: 32px;
  }
}

@media (max-width: 1024px) {
  .brand-icon {
    width: 45px;
    height: 32px;
  }

  .brand-wordmark {
    width: 120px;
    height: 30px;
  }

  .middle {
    padding: 6px 12px;
  }
}

@media (max-width: 900px) {
  .brand-icon {
    width: 42px;
    height: 30px;
  }

  .brand-wordmark {
    width: 110px;
    height: 28px;
  }
}

@media (max-width: 768px) {
  .brand-icon {
    width: 40px;
    height: 28px;
  }

  .brand-wordmark {
    width: 100px;
    height: 26px;
  }
}

@media (max-width: 1052px) {
  .middle {
    display: none;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 20px;
  }

  .actions {
    gap: 12px;
  }

  .toggle-container {
    padding: 6px 8px;
  }

  .toggle-label {
    font-size: 11px;
  }
}

@media (max-width: 360px) {
  .header {
    padding: 0 16px;
  }

  .actions {
    gap: 8px;
  }

  .icon {
    padding: 8px;
  }
}
</style>
