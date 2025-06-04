# Fix JAVA_HOME Error for Local Development

## Quick Fix (Run these commands in your terminal)

### Step 1: Check Current Java Installation
```bash
# Check if Java is installed
java -version

# List all Java versions
/usr/libexec/java_home -V
```

### Step 2: Install Java if Missing
```bash
# Install Java 17 using Homebrew
brew install openjdk@17

# Link the installation
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

### Step 3: Set JAVA_HOME (Choose Your Shell)

**For Zsh (default on macOS Catalina+):**
```bash
echo 'export JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**For Bash:**
```bash
echo 'export JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.bash_profile
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

### Step 4: Verify Setup
```bash
echo "JAVA_HOME: $JAVA_HOME"
java -version
mvn -version
```

### Step 5: Run Maven Command
```bash
# Now try your Maven command
mvn clean install -DskipTests
```

## Alternative Solutions

### If You Have Multiple Java Versions
```bash
# Set specific Java version
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Or for Java 11
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
```

### If Homebrew Java Installation Failed
```bash
# Download Java manually from Oracle or OpenJDK
# Then set JAVA_HOME to the installation path
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
```

### If Still Having Issues
```bash
# Install Xcode command line tools
sudo xcode-select --install

# Check PATH includes Java
echo $PATH

# Manually set for current session
export JAVA_HOME=/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
```

## Test Commands

After setting up JAVA_HOME, test these:

```bash
# Should show Java version
java -version

# Should show Maven version with Java path
mvn -version

# Should show the Java home path
echo $JAVA_HOME

# Now try building the project
mvn clean install -DskipTests
```

## Common Issues

1. **"No Java runtime present"** - Install Java first
2. **"JAVA_HOME not set"** - Run the export commands above
3. **"Permission denied"** - Use sudo for system installations
4. **"Command not found: mvn"** - Install Maven: `brew install maven`

Your project should build successfully after following these steps.