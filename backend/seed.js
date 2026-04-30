require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Data generation helpers
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'Punjab', 'Kerala', 'Madhya Pradesh'];
const cities = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
    'Delhi': ['New Delhi', 'Delhi'],
    'Karnataka': ['Bangalore', 'Mysore', 'Manipal', 'Mangaluru'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Vellore', 'Trichy'],
    'Telangana': ['Hyderabad', 'Warangal'],
    'West Bengal': ['Kolkata', 'Kharagpur', 'Durgapur'],
    'Uttar Pradesh': ['Noida', 'Kanpur', 'Lucknow', 'Varanasi'],
    'Rajasthan': ['Jaipur', 'Pilani', 'Jodhpur'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
    'Punjab': ['Chandigarh', 'Ludhiana', 'Patiala'],
    'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior']
};

const collegePrefixes = ['Indian Institute of ', 'National Institute of ', 'International Institute of ', 'Government Engineering College ', 'Birla Institute of ', 'Amity University ', 'Vellore Institute of ', 'Manipal Institute of ', 'Thapar University ', 'SRM University ', 'LPU ', 'Bennett University ', 'Chitkara University ', 'Galgotias University '];
const types = ['IIT', 'NIT', 'IIIT', 'Government', 'Private', 'Deemed'];
const courseNames = ['Computer Science & Engineering', 'Electronics & Communication', 'Mechanical Engineering', 'Information Technology', 'Civil Engineering', 'Electrical Engineering', 'Data Science', 'Artificial Intelligence', 'MBA', 'BBA', 'Chemical Engineering'];
const recruiters = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Goldman Sachs', 'DE Shaw', 'Flipkart', 'Adobe', 'Samsung'];

function generateColleges(count) {
    const list = [];
    // Include user's specific ones first
    const baseColleges = [
        { name: 'IIT Delhi', state: 'Delhi', location: 'Delhi', type: 'IIT', rating: 4.8 },
        { name: 'IIT Bombay', state: 'Maharashtra', location: 'Mumbai', type: 'IIT', rating: 4.9 },
        { name: 'NIT Trichy', state: 'Tamil Nadu', location: 'Tamil Nadu', type: 'NIT', rating: 4.5 },
        { name: 'NIT Surathkal', state: 'Karnataka', location: 'Karnataka', type: 'NIT', rating: 4.4 },
        { name: 'DTU', state: 'Delhi', location: 'Delhi', type: 'Government', rating: 4.3 },
        { name: 'NSUT', state: 'Delhi', location: 'Delhi', type: 'Government', rating: 4.2 },
        { name: 'VIT Vellore', state: 'Tamil Nadu', location: 'Tamil Nadu', type: 'Deemed', rating: 4.1 },
        { name: 'SRM University', state: 'Tamil Nadu', location: 'Chennai', type: 'Private', rating: 4.0 },
        { name: 'BITS Pilani', state: 'Rajasthan', location: 'Rajasthan', type: 'Deemed', rating: 4.7 },
        { name: 'Manipal Institute of Technology', state: 'Karnataka', location: 'Karnataka', type: 'Deemed', rating: 4.2 }
    ];

    for (let i = 0; i < count; i++) {
        let college;
        if (i < baseColleges.length) {
            college = baseColleges[i];
        } else {
            const state = states[Math.floor(Math.random() * states.length)];
            const city = cities[state][Math.floor(Math.random() * cities[state].length)];
            const prefix = collegePrefixes[Math.floor(Math.random() * collegePrefixes.length)];
            const name = `${prefix}${city} ${i}`;
            college = {
                name,
                state,
                location: `${city}, ${state}`,
                type: types[Math.floor(Math.random() * types.length)],
                rating: (3.5 + Math.random() * 1.4).toFixed(1)
            };
        }

        list.push({
            ...college,
            established: 1950 + Math.floor(Math.random() * 70),
            fees_min: 50000 + Math.floor(Math.random() * 200000),
            fees_max: 250000 + Math.floor(Math.random() * 300000),
            website: `https://${college.name.toLowerCase().replace(/ /g, '')}.edu.in`,
            description: `Top-tier ${college.type} institution located in ${college.location} known for excellence in technical education and research.`,
            nirf_rank: i + 1,
            accreditation: Math.random() > 0.5 ? 'NAAC A++' : 'NAAC A+',
            total_students: 5000 + Math.floor(Math.random() * 20000)
        });
    }
    return list;
}

async function seed() {
    const client = await pool.connect();
    try {
        console.log('🌱 Starting 100 College Seed...');
        
        // Clear existing data
        await client.query('TRUNCATE colleges, courses, placements, reviews, questions, answers, saved_colleges, saved_comparisons, users RESTART IDENTITY CASCADE');
        console.log('🗑️  Cleared existing data');

        const colleges = generateColleges(100);

        for (const college of colleges) {
            // Insert College
            const res = await client.query(
                `INSERT INTO colleges (name,location,state,type,established,rating,fees_min,fees_max,website,description,nirf_rank,accreditation,total_students)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
                [college.name, college.location, college.state, college.type, college.established, college.rating,
                 college.fees_min, college.fees_max, college.website, college.description, college.nirf_rank, college.accreditation, college.total_students]
            );
            const collegeId = res.rows[0].id;

            // Insert random courses (3-5 per college)
            const numCourses = 3 + Math.floor(Math.random() * 3);
            const selectedCourses = [...courseNames].sort(() => 0.5 - Math.random()).slice(0, numCourses);
            for (const courseName of selectedCourses) {
                await client.query(
                    'INSERT INTO courses (college_id,name,level,duration,annual_fee) VALUES ($1,$2,$3,$4,$5)',
                    [collegeId, courseName, Math.random() > 0.2 ? 'UG' : 'PG', 4, college.fees_min]
                );
            }

            // Insert placement data
            const avgPkg = (5 + Math.random() * 25).toFixed(2);
            const highPkg = (parseFloat(avgPkg) * (1.5 + Math.random())).toFixed(2);
            const placementPct = (70 + Math.random() * 28).toFixed(1);
            const topRecs = [...recruiters].sort(() => 0.5 - Math.random()).slice(0, 5);

            await client.query(
                'INSERT INTO placements (college_id,year,avg_package,highest_package,placement_pct,top_recruiters) VALUES ($1,$2,$3,$4,$5,$6)',
                [collegeId, 2024, avgPkg, highPkg, placementPct, topRecs]
            );
        }

        // Seed a demo user
        const hash = await bcrypt.hash('demo1234', 12);
        await client.query(
            'INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3)',
            ['Demo User', 'demo@collegecompass.in', hash]
        );

        console.log('\n✅ Successfully seeded 100 colleges, 400+ courses, and placement data!');
        console.log('👤 Demo User: demo@collegecompass.in / demo1234');
    } catch (err) {
        console.error('❌ Seed error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
