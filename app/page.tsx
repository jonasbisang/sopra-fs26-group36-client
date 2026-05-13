"use client";
 
import { useRouter } from "next/navigation";
import { TeamOutlined, CalendarOutlined, ClockCircleOutlined, CloudOutlined } from "@ant-design/icons";
import styles from './page.module.css';
import NextImage from 'next/image';
import logo from './friendlerLogo.png';
 
export default function Home() {
  const router = useRouter();
 
  return (
    <div className={styles.page}>
 
      {/* NAV */}
      <nav className={styles.nav}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <NextImage
                  src={logo}
                  alt="Friendler Logo"
                  height={60}
                  width={250}
                  />
        </div>
        <div className={styles.navBtns}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => router.push('/login')}>Login</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push('/register')}>Register</button>
        </div>
      </nav>
 
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.glowDot} style={{ width: 400, height: 400, background: 'rgba(66,162,214,0.06)', top: -100, right: 200 }} />
        <div className={styles.glowDot} style={{ width: 300, height: 300, background: 'rgba(255,66,56,0.05)', bottom: 0, right: 400 }} />
 
        <div className={styles.heroContent}>
          <div className={`${styles.heroTag} ${styles.fadeIn}`}>✦ Group activity planning</div>
          <h1 className={`${styles.heroTitle} ${styles.fadeIn}`}>
            Stop texting.<br />Start <span style={{ color: '#ffdc00' }}>meeting.</span>
          </h1>
          <p className={`${styles.heroSubtitle} ${styles.fadeIn}`}>
            Friendler finds the time, checks the weather, and makes sure your friend group actually shows up.
          </p>
        </div>
 
        {/* CHARACTERS */}
        <div className={styles.characters}>
          <div className={styles.character}>
            <div className={styles.charBody} style={{ background: 'rgba(255,66,56,0.12)' }}>
              <div className={styles.charHead} style={{ background: 'rgba(255,66,56,0.2)' }}>👩‍🦱</div>
              <div className={styles.charBadge} style={{ background: '#ff4238' }}>✓</div>
            </div>
            <span className={styles.charName}>Monica</span>
          </div>
          <div className={styles.character}>
            <div className={styles.charBody} style={{ background: 'rgba(255,220,0,0.12)' }}>
              <div className={styles.charHead} style={{ background: 'rgba(255,220,0,0.2)' }}>🧔</div>
              <div className={styles.charBadge} style={{ background: '#ffdc00' }}>♥</div>
            </div>
            <span className={styles.charName}>Joey</span>
          </div>
          <div className={styles.character}>
            <div className={styles.charBody} style={{ background: 'rgba(66,162,214,0.12)' }}>
              <div className={styles.charHead} style={{ background: 'rgba(66,162,214,0.2)' }}>👱‍♀️</div>
              <div className={styles.charBadge} style={{ background: '#42a2d6' }}>✓</div>
            </div>
            <span className={styles.charName}>Rachel</span>
          </div>
          <div className={styles.character}>
            <div className={styles.charBody} style={{ background: 'rgba(66,214,120,0.12)' }}>
              <div className={styles.charHead} style={{ background: 'rgba(66,214,120,0.2)' }}>🧑‍💼</div>
              <div className={styles.charBadge} style={{ background: '#42d678' }}>♥</div>
            </div>
            <span className={styles.charName}>Chandler</span>
          </div>
        </div>
 
        {/* SCROLL ARROW */}
        <div
          className={styles.scrollArrow}
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className={styles.scrollLabel}>scroll</span>
          <span className={styles.scrollIcon}>↓</span>
        </div>
      </section>
 
      {/* DIVIDER */}
      <div className={styles.sectionDivider}>
        <span className={styles.sectionDividerLabel}>How it works</span>
      </div>
 
      {/* STEPS */}
      <div className={styles.steps}>
        <p className={styles.stepsTitle}>Three steps to hanging out</p>
 
        <div className={styles.step}>
          <div className={styles.stepLeft}>
            <div className={styles.stepNum} style={{ color: '#42a2d6', borderColor: 'rgba(66,162,214,0.3)' }}>1</div>
          </div>
          <div className={styles.stepRight}>
            <div className={styles.stepIcon}>👥</div>
            <p className={styles.stepRightTitle}>Create a group</p>
            <p className={styles.stepRightText}>Invite your friends with a simple group ID and password. Everyone joins in seconds.</p>
          </div>
        </div>
 
        <div className={styles.step}>
          <div className={styles.stepLeft}>
            <div className={styles.stepNum} style={{ color: '#ffdc00', borderColor: 'rgba(255,220,0,0.3)' }}>2</div>
          </div>
          <div className={styles.stepRight}>
            <div className={styles.stepIcon}>💡</div>
            <p className={styles.stepRightTitle}>Propose & vote on activities</p>
            <p className={styles.stepRightText}>Anyone can suggest an activity. Everyone swipes to like or pass. Once enough people are in, Friendler takes over.</p>
          </div>
        </div>
 
        <div className={styles.step}>
          <div className={styles.stepLeft}>
            <div className={styles.stepNum} style={{ color: '#ff4238', borderColor: 'rgba(255,66,56,0.3)' }}>3</div>
          </div>
          <div className={styles.stepRight}>
            <div className={styles.stepIcon}>📅</div>
            <p className={styles.stepRightTitle}>We find the time</p>
            <p className={styles.stepRightText}>Friendler checks everyone&apos;s availability, checks the forecast for outdoor activities, and locks in a time that works.</p>
          </div>
        </div>
      </div>
 
      {/* DIVIDER */}
      <div className={styles.sectionDivider}>
        <span className={styles.sectionDividerLabel}>Features</span>
      </div>
 
      {/* FEATURES */}
      <div className={styles.features}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ background: 'rgba(66,162,214,0.15)', color: '#42a2d6' }}>
              <CalendarOutlined />
            </div>
            <p className={styles.featureTitle}>Smart scheduling</p>
            <p className={styles.featureText}>Automatically finds a slot where everyone is free, based on their personal calendar blocks.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ background: 'rgba(255,220,0,0.15)', color: '#ffdc00' }}>
              <CloudOutlined />
            </div>
            <p className={styles.featureTitle}>Weather-aware</p>
            <p className={styles.featureText}>Outdoor activity? Friendler checks the forecast and reschedules if the weather won&apos;t cooperate.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ background: 'rgba(255,66,56,0.15)', color: '#ff4238' }}>
              <TeamOutlined />
            </div>
            <p className={styles.featureTitle}>Swipe-style voting</p>
            <p className={styles.featureText}>Like or pass on activities with one click. No group chat chaos, no endless back and forth.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ background: 'rgba(66,214,120,0.15)', color: '#42d678' }}>
              <ClockCircleOutlined />
            </div>
            <p className={styles.featureTitle}>Instant notifications</p>
            <p className={styles.featureText}>Get notified the moment an activity reaches enough votes and a time is confirmed for everyone.</p>
          </div>
        </div>
      </div>
 
      {/* CTA */}
      <div className={styles.cta}>
        <div className={styles.ctaInner}>
          <p className={styles.ctaTitle}>Ready to actually hang out?</p>
          <p className={styles.ctaText}>Join Friendler and stop letting plans fall through the cracks.</p>
          <div className={styles.ctaBtns}>
            <button className={`${styles.btn} ${styles.btnGreen}`} onClick={() => router.push('/register')}>
              Create your account
            </button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => router.push('/login')}>
              Login
            </button>
          </div>
        </div>
      </div>
 
      {/* FOOTER */}
      <footer className={styles.footer}>
        <span>Friendler · Group 36 · SoPra FS26</span>
        <span>Made with ♥ in Zürich</span>
      </footer>
 
    </div>
  );
}