/* main.js */

// Scroll Animation Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            entry.target.classList.remove('active');
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.scroll-animate, .scroll-left, .scroll-right').forEach((el) => {
    observer.observe(el);
});

// Review Carousel Slider Ticker
let currentSlide = 0;
const track = document.getElementById('review-track');
setInterval(() => {
    currentSlide = (currentSlide + 1) % 2;
    if(track && track.children.length > 0) {
        const cardWidth = track.children[0].offsetWidth + 32;
        track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
    }
}, 4000);

// Smooth Counter Animation with Prefix & Suffix Support
const counters = document.querySelectorAll('.counter');
const speed = 50;

counters.forEach(counter => {
    const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '+';
        const current = +counter.innerText.replace(/[^0-9]/g, '') || 0;
        
        const increment = target / speed;

        if (current < target) {
            const nextVal = Math.ceil(current + increment);
            counter.innerText = prefix + (nextVal > target ? target : nextVal).toLocaleString() + suffix;
            setTimeout(updateCount, 30);
        } else {
            counter.innerText = prefix + target.toLocaleString() + suffix;
        }
    };

    updateCount();
});

// Modal Controls
function openDonateModal() {
    const modal = document.getElementById('donation-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.getElementById('step-1').classList.remove('hidden');
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.add('hidden');
}

function closeDonateModal() {
    document.getElementById('donation-modal').classList.add('hidden');
    document.getElementById('donation-modal').classList.remove('flex');
}

function setAmount(val, btn) {
    document.getElementById('custom-amount').value = val;
    document.querySelectorAll('.amount-btn').forEach(b => {
        b.classList.remove('border-teal-600', 'bg-teal-50', 'text-teal-700');
        b.classList.add('border-gray-200', 'text-gray-700');
    });
    btn.classList.add('border-teal-600', 'bg-teal-50', 'text-teal-700');
    btn.classList.remove('border-gray-200');
}

function goToBankDetails() {
    const name = document.getElementById('donor-name').value;
    const email = document.getElementById('donor-email').value;
    const amount = document.getElementById('custom-amount').value;

    if(!name || !email || !amount) {
        alert('Please enter your name, email, and donation amount.');
        return;
    }

    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
}

function backToStep1() {
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-1').classList.remove('hidden');
}

function copyAccNumber() {
    navigator.clipboard.writeText('0123456789');
    alert('Account number copied to clipboard!');
}

async function confirmTransfer() {
    const name = document.getElementById('donor-name').value || 'Anonymous Donor';
    const amount = document.getElementById('custom-amount').value;
    const refCode = 'FLR-' + Math.floor(10000 + Math.random() * 90000) + '-2026';

    try {
        const response = await fetch('http://localhost:5000/api/donations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ref: refCode,
                name: name,
                amount: '$' + amount,
                status: 'Pending Verification'
            })
        });
        const data = await response.json();
        if(data.success) {
            console.log('Donation submitted for review.');
        }
    } catch (err) {
        console.error('Error submitting donation:', err);
    }

    document.getElementById('tracking-ref-code').innerText = refCode;
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
}

// Volunteer Form Submission
function openVolunteerModal() {
    document.getElementById('volunteer-modal').classList.remove('hidden');
    document.getElementById('volunteer-modal').classList.add('flex');
}
function closeVolunteerModal() {
    document.getElementById('volunteer-modal').classList.add('hidden');
}
async function submitVolunteer(e) {
    e.preventDefault();
    const name = document.getElementById('vol-name').value;
    const email = document.getElementById('vol-email').value;
    const skills = document.getElementById('vol-skills').value;

    try {
        const response = await fetch('http://localhost:5000/api/volunteer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, skills })
        });
        const data = await response.json();
        if(data.success) {
            alert('Volunteer application submitted successfully! Email notification sent.');
            closeVolunteerModal();
        } else {
            alert('Failed to send volunteer application.');
        }
    } catch (err) {
        console.error(err);
        alert('Error connecting to backend server. Make sure server.js is running.');
    }
}

// Partner Form Submission
function openPartnerModal() {
    document.getElementById('partner-modal').classList.remove('hidden');
    document.getElementById('partner-modal').classList.add('flex');
}
function closePartnerModal() {
    document.getElementById('partner-modal').classList.add('hidden');
}
async function submitPartner(e) {
    e.preventDefault();
    const org = document.getElementById('partner-org').value;
    const email = document.getElementById('partner-email').value;
    const interest = document.getElementById('partner-interest').value;

    try {
        const response = await fetch('http://localhost:5000/api/partner', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ org, email, interest })
        });
        const data = await response.json();
        if(data.success) {
            alert('Partnership inquiry sent successfully! Email notification sent.');
            closePartnerModal();
        } else {
            alert('Failed to send partnership inquiry.');
        }
    } catch (err) {
        console.error(err);
        alert('Error connecting to backend server. Make sure server.js is running.');
    }
}

// Admin Login & Signup Modals
function openAdminLoginModal() {
    document.getElementById('admin-login-modal').classList.remove('hidden');
    document.getElementById('admin-login-modal').classList.add('flex');
}
function closeAdminLoginModal() {
    document.getElementById('admin-login-modal').classList.add('hidden');
}

function openAdminSignupModal() {
    document.getElementById('admin-signup-modal').classList.remove('hidden');
    document.getElementById('admin-signup-modal').classList.add('flex');
}
function closeAdminSignupModal() {
    document.getElementById('admin-signup-modal').classList.add('hidden');
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('admin-login-user').value;
    const password = document.getElementById('admin-login-pass').value;

    try {
        const response = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if(data.success) { 
            closeAdminLoginModal(); 
            openAdminTracker(); 
        } else { 
            alert("Access Denied: " + (data.message || 'Invalid credentials')); 
        }
    } catch (err) {
        console.error(err);
        alert('Error connecting to backend server.');
    }
}

async function handleAdminSignup(e) {
    e.preventDefault();
    const username = document.getElementById('admin-signup-user').value;
    const password = document.getElementById('admin-signup-pass').value;

    try {
        const response = await fetch('http://localhost:5000/api/admin/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        alert(data.message);
        if(data.success) {
            closeAdminSignupModal();
        }
    } catch (err) {
        console.error(err);
        alert('Error connecting to backend server.');
    }
}

// Admin Donations Ledger Viewer
async function openAdminTracker() {
    let donationsLedger = [];
    try {
        const res = await fetch('http://localhost:5000/api/donations');
        donationsLedger = await res.json();
    } catch (err) {
        console.error('Could not fetch ledger', err);
    }

    const tbody = document.getElementById('ledger-table-body');
    tbody.innerHTML = '';
    
    if(donationsLedger.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-400">No donations recorded yet.</td></tr>`;
    } else {
        donationsLedger.forEach(item => {
            const isVerified = item.status === 'Verified';
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b">
                    <td class="p-3 font-mono font-bold text-teal-700">${item.ref || 'N/A'}</td>
                    <td class="p-3">${item.name || 'Anonymous'}</td>
                    <td class="p-3 font-bold">${item.amount || '$0'}</td>
                    <td class="p-3">
                        <span class="${isVerified ? 'bg-green-100 text-teal-800' : 'bg-yellow-100 text-yellow-800'} px-2 py-0.5 rounded text-[10px] font-bold">
                            ${item.status || 'Pending Verification'}
                        </span>
                    </td>
                    <td class="p-3">
                        ${!isVerified ? `<button onclick="verifyDonation('${item._id}')" class="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded text-xs font-bold transition">Approve</button>` : '<span class="text-xs text-gray-400">Approved</span>'}
                    </td>
                </tr>
            `;
        });
    }
    
    document.getElementById('admin-modal').classList.remove('hidden');
    document.getElementById('admin-modal').classList.add('flex');
}

// Function to approve pending donations from admin dashboard
async function verifyDonation(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/donations/${id}/verify`, {
            method: 'PATCH'
        });
        const data = await res.json();
        if(data.success) {
            alert('Donation approved and verified successfully!');
            openAdminTracker(); // Refresh table
        }
    } catch (err) {
        console.error('Failed to verify donation:', err);
        alert('Error approving donation.');
    }
}

function closeAdminTracker() {
    document.getElementById('admin-modal').classList.add('hidden');
    document.getElementById('admin-modal').classList.remove('flex');
}

// Hero Image Carousel Slider Ticker
let currentHeroSlide = 0;
const heroTrack = document.getElementById('hero-slider');
setInterval(() => {
    if (heroTrack && heroTrack.children.length > 0) {
        currentHeroSlide = (currentHeroSlide + 1) % heroTrack.children.length;
        const slideWidth = heroTrack.parentElement.clientWidth;
        heroTrack.style.transform = `translateX(-${currentHeroSlide * slideWidth}px)`;
    }
}, 4000);

// Mission Section Image Slider Ticker
let currentMissionSlide = 0;
const missionTrack = document.getElementById('mission-slider');
setInterval(() => {
    if (missionTrack && missionTrack.children.length > 0) {
        currentMissionSlide = (currentMissionSlide + 1) % missionTrack.children.length;
        const slideWidth = missionTrack.parentElement.clientWidth;
        missionTrack.style.transform = `translateX(-${currentMissionSlide * slideWidth}px)`;
    }
}, 4000);