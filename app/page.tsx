"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import { useRouter } from "next/navigation";
import { Button } from "antd";
import styles from "@/styles/page.module.css";
import NextImage from 'next/image';
import logo from './friendlerLogo.png';
import { TeamOutlined, CalendarOutlined, ClockCircleOutlined, CloudOutlined } from "@ant-design/icons";

export default function Home() {
  const router = useRouter();
  return (
    <div className={styles.page}>
      <nav style={{
}}>
  <NextImage
    src={logo}
    alt="Friendler Logo"
    height={160}
    width={480}
  />
      </nav>

      <section style={{
        padding: '1rem 0rem 12rem',
        textAlign: 'center',
        maxWidth: '960',
      }}>

        <h1 style={{
          fontSize: '35px',
          fontWeight: 500,
          lineHeight: 1.2,
          letterSpacing: '-0.5px',
          marginBottom: '1rem',
        }}>
       We make sure you and your friends meet up!
        </h1>

        <p style={{
          fontSize: '20px',
          color: '#6b7280',
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}>
        Friendler makes sure you and your friends find the time 
        to meet up, without endless back and forth texting.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            type="primary"
            size="large"
            onClick={() => router.push('/login')}
            style={{ backgroundColor: '#228d32', borderRadius: '999px'}}
          >
            Login
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={() => router.push('/register')}
            style={{ backgroundColor: '#000000b8',borderRadius: '999px'}}
          >
            Register
          </Button>
          
          <Button size="large" onClick={() => router.push('/information')}
          style={{ backgroundColor: '#f9f7f7b8',borderRadius: '999px'}}>
            Information
          </Button>
        </div>
      </section>

    
      <section style={{
      }}>
        <p style={{
          fontSize: '30px',
          color: '#000000',
          fontWeight: 800,
          textAlign: 'center',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
          marginTop:'0rem',
        }}>
          Features
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {[
            {
              title: 'Invite Friends',
              desc: 'Create a group and invite your friends.',
              icon: <TeamOutlined/>
            },
            {
              title: 'Enter Activity',
              desc: 'Enter a activity you want to do and decide if you want to join one your friends added. ',
              icon: <CalendarOutlined />
            },
            {
              title: 'Compare Availability',
              desc: 'Once a acitivity reaches enough members Friendler automarically finds a time where everyone is available.',
              icon: <ClockCircleOutlined />
            },
            {
              title: 'Weather dependence',
              desc: 'Friendler checks the forecast for outdoor activities and creates a new time if the weather does not meet excpectations.',
              icon: <CloudOutlined />
            },
          ].map((feature) => (
            <div key={feature.title} style={{
              backgroundColor: '#02020220',
              borderRadius: '12px',
              padding: '1.25rem',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                display:'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '18px',
                color: '#000000'
                }}>
              {feature.icon}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{
        padding: '2rem',
        paddingTop:'8rem',
        textAlign: 'center',
        fontSize: '13px',
        color: '#00000088',
        width: '100%',
        marginTop: '2rem',
      }}>
        Friendler · Group 36 · SoPra FS26
      </footer>
    </div>
  );
}
