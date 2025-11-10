'use client'

import React from 'react'
import Link from 'next/link'
import styles from './storybook.module.css'

export default function StorybookPage() {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.logo} aria-hidden>
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className={styles.appName}>Grocery App</h2>
          </div>

          <div className={styles.headerRight}>
            <nav className={styles.topNav}>
              <Link href="#">Home</Link>
              <Link href="#">Lists</Link>
              <Link href="#">Recipes</Link>
              <Link href="#">Settings</Link>
            </nav>

            <div className={styles.headerActions}>
              <button className={styles.iconBtn} aria-label="Notifications">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"/></svg>
              </button>

              <div className={styles.avatar} aria-hidden style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBseiBmOmpmTPshxnbArYqSnE1z7cqUGI7ss7BdGVsii57B-mx_g5RWY6kg3OUH4QW0skfh62KqWSQI-bUlCCa2ui-eGSm27CtCrkSRjR2IMnsCtfSTsfFv-H9gsoaoQXPNpjVETet1fvsANWZ941TF6cDVGgDSlp_ZJVW76M53bcDQLgliN2uaBxZrnIF346Phoi25QU1VkwHeRl8Gx-lge8FqSDqkb8ViYT1tcs6Aw2DBv-pzWbl0H7oZlXtmuApZ0Jf7-XQ0UhEB)' }} />
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.content}>
            <h1 className={styles.pageTitle}>Design System / Storybook</h1>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Contenedores y Layout</h2>
              <p>Grid: The main grid uses a 12-column layout. Containers: Content is organized within containers. Two-Column Layout: For side-by-side content, a two-column layout is used.</p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>2. Tipografía y Colores</h2>
              <div className={styles.colorList}>
                <div className={styles.colorRow}><span>Primary</span><span className={styles.mono}>#6200EE</span></div>
                <div className={styles.colorRow}><span>Secondary</span><span className={styles.mono}>#03DAC5</span></div>
                <div className={styles.colorRow}><span>Neutrals</span><span className={styles.mono}>#F2F2F7</span></div>
                <div className={styles.colorRow}><span>Success</span><span className={styles.mono}>#4CAF50</span></div>
                <div className={styles.colorRow}><span>Error</span><span className={styles.mono}>#F44336</span></div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>3. Componentes Interactivos</h2>

              <h3 className={styles.subTitle}>Buttons</h3>
              <div className={styles.row}>
                <button className={styles.primary}>Primary</button>
                <button className={styles.secondary}>Secondary</button>
              </div>

              <h3 className={styles.subTitle}>Forms</h3>
              <div className={styles.formRow}>
                <input className={styles.input} placeholder="Input Field" />
                <textarea className={styles.textarea} placeholder="Text Area" />
                <select className={styles.select}>
                  <option>Select</option>
                  <option>two</option>
                </select>
              </div>

              <div className={styles.checkboxRow}>
                <label className={styles.checkboxItem}><input type="checkbox"/> Checkbox 1</label>
                <label className={styles.checkboxItem}><input type="checkbox"/> Checkbox 2</label>
              </div>

              <div className={styles.radioGroup}>
                <label className={styles.radioItem}><input type="radio" name="radio-demo" defaultChecked/> Radio 1</label>
                <label className={styles.radioItem}><input type="radio" name="radio-demo"/> Radio 2</label>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleLabel}>Toggle</div>
                <label className={styles.toggle}>
                  <input type="checkbox" aria-label="Toggle example"/>
                </label>
              </div>

            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Modals / Tabs / Progress</h2>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Modal Title</div>
                <div className={styles.cardBody}>Modal Content. Includes action buttons like &apos;Cancel&apos; and &apos;Accept&apos;.</div>
              </div>

              <div className={styles.tabs}>
                <button className={styles.tabActive}>Tab 1</button>
                <button className={styles.tab}>Tab 2</button>
                <button className={styles.tab}>Tab 3</button>
              </div>

              <div className={styles.progressRow}>
                <div className={styles.progressLabel}>Progress</div>
                <div className={styles.progressBar}><div className={styles.progressFill} style={{width: '60%'}}/></div>
                <div className={styles.progressPct}>60%</div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Avatars / Composed</h2>
              <div className={styles.avatarRow}>
                <div className={styles.avatarSmall} style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAZqMI731QT4fu0XdBy0ZaraSpOUiIov7qSg9ppFn6QLFGxOnJbt2BP_VIOTegr24ioU5aiHaICa5W25QNHgn7EXq84u0h9u0xVrwZD4GYFSIJqD5ygtWPfxKobK0RfVQdhAgo6n5odZJiMsdHmVIWal3sH_QH1HUZoMH5o1k8MZMr-NlfsRteLDevAWdfcSiOM94NvBHBWz64ykEenK9YMQxdzlv3iG9oRYt0hsyL1EY0pyjvjPS0BdnLq8SRNVMDvfjpOlKGT2p1k)'}}/>
                <div className={styles.avatarSmall} style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBrW-9_C5PuZcctKl6IV3hpKocwoi_3joEfUcxkvzhbm3BgNRUXiIqt_pH8HFdlpvgg_N37W6M-umEgWV9-_QhgQGVq67nM9f8GeGPm_k5BNIGtVZVG_0EgICxR_2D1G44jkT210_2ER7y5I_7dOT3Qqxy0G96-sCjMkkAjuOfqGqjn3asJzh4rxYaQOJl6iXRIisR5rqfz3MK3pDzw8S6uxfJmbST5LeHP3c1GKeTTKCHGUJyC3PEicKU2k92wQpHHnOzyebbXbKnJ)'}}/>
                <div className={styles.avatarSmall} style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBRU-Z5lMdZ9KRy8w0QNu2xiUfH61MCnqdvdOKD-uJIS_2Bc_oBPt-yBZuiaK3kr4ROL2h-lfQojF5O3SBoex-XibOID9HomMkUpviYOQtnM8zPSzO4sulpE4s6jW2-BXxLTtak7K81o5cMpo9N3rMBnwYHTEsh7WnfWOYhvyf1W9o_s3bfdVWXXoTZJyqPPvZwoQ_S5R-IXPTeKX9qE2mgSASm5kVkvro2WWdWMzc9OPN-feM3xLMni3HTOqiRwVbdS8o1E79QDZYP)'}}/>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}
