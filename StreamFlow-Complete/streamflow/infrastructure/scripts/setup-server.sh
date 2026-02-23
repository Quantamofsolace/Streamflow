#!/bin/bash
# infrastructure/scripts/setup-server.sh
# Run ONCE on the base EC2 instance before taking the AMI snapshot.
# After this script finishes, take an AMI — every ASG server will be pre-configured.

set -e  # exit immediately on any error
echo "=== StreamFlow Server Setup Starting ==="

# 1. Update system packages
yum update -y

# 2. Install Node.js 20 LTS
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git

# 3. Install CloudWatch agent (sends logs to CloudWatch)
yum install -y amazon-cloudwatch-agent

# 4. Create system user (never run app as root)
useradd -r -s /bin/false streamflow 2>/dev/null || true
mkdir -p /opt/streamflow/app

# 5. Copy application code
# CHANGE: replace with your git clone command
# git clone https://github.com/YOUR_ORG/streamflow.git /opt/streamflow/app
# OR scp your files here first, then:
cp -r /tmp/streamflow/* /opt/streamflow/app/ 2>/dev/null || true

# 6. Install npm dependencies
cd /opt/streamflow/app/frontend && npm install --omit=dev
cd /opt/streamflow/app/backend  && npm install --omit=dev

# 7. Copy systemd service files
cp /opt/streamflow/app/infrastructure/scripts/streamflow-frontend.service /etc/systemd/system/
cp /opt/streamflow/app/infrastructure/scripts/streamflow-backend.service  /etc/systemd/system/

# 8. Enable services so they auto-start on every boot (including ASG launches)
systemctl daemon-reload
systemctl enable streamflow-frontend
systemctl enable streamflow-backend
systemctl enable amazon-cloudwatch-agent

# 9. Fix ownership
chown -R streamflow:streamflow /opt/streamflow

echo "=== Setup complete. Ready to take AMI. ==="
echo "Test with:"
echo "  sudo systemctl start streamflow-backend"
echo "  curl http://localhost:4000/health"
