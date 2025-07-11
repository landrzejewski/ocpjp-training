# Moduły Java 9

## Spis treści

1. [Wprowadzenie do systemu modułów](#wprowadzenie)
2. [Dlaczego moduły?](#dlaczego-moduly)
3. [Podstawowe pojęcia](#podstawowe-pojecia)
4. [Struktura modułu](#struktura-modulu)
5. [Plik module-info.java](#module-info)
6. [Typy modułów](#typy-modulow)
7. [Praktyczne przykłady](#praktyczne-przyklady)
8. [Migracja istniejących aplikacji](#migracja)
9. [Narzędzia i komendy](#narzedzia)
10. [Najlepsze praktyki](#najlepsze-praktyki)
11. [Rozwiązywanie problemów](#troubleshooting)
12. [Podsumowanie](#podsumowanie)

## 1. Wprowadzenie do systemu modułów {#wprowadzenie}

System modułów (Project Jigsaw) został wprowadzony w Java 9 jako fundamentalna zmiana w architekturze platformy Java. Jest to największa zmiana od wprowadzenia generyków w Java 5.

### Czym jest moduł?

Moduł to samoopisująca się jednostka kodu zawierająca:
- Pakiety Java
- Zasoby
- Metadane opisujące moduł i jego zależności

### Kluczowe cechy systemu modułów:

- **Silna enkapsulacja** - kontrola dostępu na poziomie pakietów
- **Niezawodna konfiguracja** - weryfikacja zależności podczas kompilacji i uruchamiania
- **Lepsza wydajność** - optymalizacja ładowania klas
- **Skalowalność** - możliwość tworzenia mniejszych obrazów runtime

## 2. Dlaczego moduły? {#dlaczego-moduly}

### Problemy przed Java 9:

#### 1. Classpath Hell
```bash
# Przykład problematycznego classpath
java -cp lib/app.jar:lib/lib1.jar:lib/lib2.jar:lib/lib3.jar com.example.Main
```

Problemy:
- Brak jasnej hierarchii zależności
- Konflikty wersji bibliotek
- Trudności w określeniu, które klasy są faktycznie używane

#### 2. Brak prawdziwej enkapsulacji
```java
// Przed Java 9 - dostęp do wewnętrznych API
import sun.misc.Unsafe;  // Nie powinno być dostępne!
```

#### 3. Monolityczna platforma
- Cały JDK musiał być załadowany, nawet jeśli używaliśmy tylko części
- Brak możliwości tworzenia zoptymalizowanych runtime'ów

### Rozwiązania oferowane przez moduły:

1. **Jawne zależności** - każdy moduł deklaruje, czego potrzebuje
2. **Silna enkapsulacja** - tylko to, co eksportowane jest dostępne
3. **Modularny JDK** - możliwość używania tylko potrzebnych modułów

## 3. Podstawowe pojęcia {#podstawowe-pojecia}

### Kluczowe terminy:

**Moduł** - nazwana, samoopisująca się jednostka kodu

**Module descriptor** - plik `module-info.java` definiujący charakterystykę modułu

**Requires** - deklaracja zależności od innego modułu

**Exports** - udostępnienie pakietu innym modułom

**Opens** - umożliwienie refleksyjnego dostępu do pakietu

**Uses/Provides** - mechanizm usług (Service Provider Interface)

### Przykład podstawowych relacji:
```java
// Moduł A
module moduleA {
    exports com.example.api;  // Udostępnia pakiet
}

// Moduł B
module moduleB {
    requires moduleA;  // Wymaga modułu A
    // Może używać com.example.api
}
```

## 4. Struktura modułu {#struktura-modulu}

### Typowa struktura projektu modułowego:

```
my-application/
├── src/
│   ├── module-info.java
│   └── com/
│       └── mycompany/
│           └── myapp/
│               ├── Main.java
│               ├── service/
│               │   └── UserService.java
│               └── model/
│                   └── User.java
├── test/
│   └── com/
│       └── mycompany/
│           └── myapp/
│               └── service/
│                   └── UserServiceTest.java
└── pom.xml lub build.gradle
```

### Struktura wielomodułowa:

```
multi-module-project/
├── parent-pom.xml
├── module-api/
│   ├── src/main/java/
│   │   ├── module-info.java
│   │   └── com/example/api/
│   └── pom.xml
├── module-core/
│   ├── src/main/java/
│   │   ├── module-info.java
│   │   └── com/example/core/
│   └── pom.xml
└── module-app/
    ├── src/main/java/
    │   ├── module-info.java
    │   └── com/example/app/
    └── pom.xml
```

## 5. Plik module-info.java {#module-info}

### Podstawowa składnia:

```java
module com.example.mymodule {
    // Zależności
    requires java.base;              // Domyślnie, można pominąć
    requires java.sql;               // Wymaga modułu java.sql
    requires transitive java.xml;    // Zależność przechodnia
    requires static java.compiler;   // Zależność opcjonalna (compile-time)
    
    // Eksporty
    exports com.example.api;                        // Eksportuje pakiet
    exports com.example.internal to com.example.ui; // Eksport ukierunkowany
    
    // Otwieranie dla refleksji
    opens com.example.beans;                        // Otwiera pakiet
    opens com.example.dto to com.fasterxml.jackson.databind; // Otwarcie ukierunkowane
    
    // Usługi
    uses com.example.spi.Plugin;                    // Używa usługi
    provides com.example.spi.Plugin with            // Dostarcza implementację
        com.example.impl.MyPlugin;
}
```

### Szczegółowy przykład z komentarzami:

```java
/**
 * Moduł aplikacji do zarządzania użytkownikami
 */
module com.mycompany.userapp {
    // === ZALEŻNOŚCI ===
    
    // Standardowe moduły Java
    requires java.sql;          // Dla JDBC
    requires java.logging;      // Dla logowania
    
    // Zależności przechodnie - eksportowane dalej
    requires transitive java.desktop;  // GUI - dostępne dla modułów zależnych
    
    // Zależności opcjonalne - tylko podczas kompilacji
    requires static java.compiler;     // Dla narzędzi kompilacji
    
    // Zewnętrzne biblioteki
    requires org.slf4j;                // Logowanie
    requires spring.context;           // Spring Framework
    requires hibernate.core;           // Hibernate ORM
    
    // === EKSPORTY ===
    
    // API publiczne - dostępne dla wszystkich
    exports com.mycompany.userapp.api;
    exports com.mycompany.userapp.dto;
    
    // Eksport ukierunkowany - tylko dla określonych modułów
    exports com.mycompany.userapp.internal.utils 
        to com.mycompany.userapp.test;
    
    // === REFLEKSJA ===
    
    // Otwarte dla refleksji (np. dla frameworków)
    opens com.mycompany.userapp.entity to 
        hibernate.core,
        spring.core;
    
    // Otwarte dla serializacji JSON
    opens com.mycompany.userapp.dto to 
        com.fasterxml.jackson.databind;
    
    // === USŁUGI ===
    
    // Używane usługi
    uses javax.sql.DataSource;
    uses com.mycompany.userapp.spi.UserValidator;
    
    // Dostarczane implementacje
    provides com.mycompany.userapp.spi.UserValidator with
        com.mycompany.userapp.impl.EmailValidator,
        com.mycompany.userapp.impl.PasswordValidator;
}
```

## 6. Typy modułów {#typy-modulow}

### 1. Named Modules (Nazwane moduły)
Moduły z plikiem `module-info.java`:

```java
// module-info.java
module com.example.named {
    requires java.sql;
    exports com.example.api;
}
```

### 2. Automatic Modules (Moduły automatyczne)
JAR-y bez `module-info.java` umieszczone na module path:

```bash
# Automatyczny moduł z JAR-a
java --module-path lib/legacy.jar --add-modules ALL-MODULE-PATH
```

Nazwa modułu automatycznego:
- Bazuje na nazwie JAR-a
- `commons-lang3-3.12.0.jar` → moduł `commons.lang3`

### 3. Unnamed Module (Moduł nienazwany)
Kod na classpath (kompatybilność wsteczna):

```bash
# Kod w module nienazwanym
java -cp lib/old-app.jar com.example.Main
```

### Przykład mieszania typów modułów:

```java
// Nazwany moduł używający automatycznego modułu
module com.example.app {
    requires commons.lang3;     // Automatyczny moduł
    requires java.sql;          // Moduł platformy
    requires com.example.core;  // Inny nazwany moduł
}
```

## 7. Praktyczne przykłady {#praktyczne-przyklady}

### Przykład 1: Prosta aplikacja modułowa

#### Struktura projektu:
```
simple-app/
├── src/
│   ├── module-info.java
│   └── com/example/app/
│       ├── Main.java
│       └── service/
│           └── GreetingService.java
```

#### module-info.java:
```java
module com.example.app {
    requires java.logging;
    exports com.example.app.service;
}
```

#### GreetingService.java:
```java
package com.example.app.service;

import java.util.logging.Logger;

public class GreetingService {
    private static final Logger logger = 
        Logger.getLogger(GreetingService.class.getName());
    
    public String greet(String name) {
        String greeting = "Hello, " + name + "!";
        logger.info("Generated greeting: " + greeting);
        return greeting;
    }
}
```

#### Main.java:
```java
package com.example.app;

import com.example.app.service.GreetingService;

public class Main {
    public static void main(String[] args) {
        GreetingService service = new GreetingService();
        System.out.println(service.greet("World"));
    }
}
```

#### Kompilacja i uruchomienie:
```bash
# Kompilacja
javac -d out src/module-info.java src/com/example/app/*.java \
      src/com/example/app/service/*.java

# Uruchomienie
java --module-path out --module com.example.app/com.example.app.Main
```

### Przykład 2: Aplikacja wielomodułowa

#### Struktura:
```
multi-module-app/
├── api-module/
│   └── src/
│       ├── module-info.java
│       └── com/example/api/
│           └── UserService.java
├── core-module/
│   └── src/
│       ├── module-info.java
│       └── com/example/core/
│           └── UserServiceImpl.java
└── app-module/
    └── src/
        ├── module-info.java
        └── com/example/app/
            └── Application.java
```

#### api-module/module-info.java:
```java
module com.example.api {
    exports com.example.api;
}
```

#### UserService.java:
```java
package com.example.api;

public interface UserService {
    String getUserById(int id);
    void createUser(String name);
}
```

#### core-module/module-info.java:
```java
module com.example.core {
    requires com.example.api;
    exports com.example.core;
}
```

#### UserServiceImpl.java:
```java
package com.example.core;

import com.example.api.UserService;
import java.util.HashMap;
import java.util.Map;

public class UserServiceImpl implements UserService {
    private Map<Integer, String> users = new HashMap<>();
    private int nextId = 1;
    
    @Override
    public String getUserById(int id) {
        return users.getOrDefault(id, "User not found");
    }
    
    @Override
    public void createUser(String name) {
        users.put(nextId++, name);
        System.out.println("User created: " + name);
    }
}
```

#### app-module/module-info.java:
```java
module com.example.app {
    requires com.example.api;
    requires com.example.core;
}
```

#### Application.java:
```java
package com.example.app;

import com.example.api.UserService;
import com.example.core.UserServiceImpl;

public class Application {
    public static void main(String[] args) {
        UserService service = new UserServiceImpl();
        
        service.createUser("Jan Kowalski");
        service.createUser("Anna Nowak");
        
        System.out.println("User 1: " + service.getUserById(1));
        System.out.println("User 2: " + service.getUserById(2));
        System.out.println("User 3: " + service.getUserById(3));
    }
}
```

### Przykład 3: Service Provider Interface (SPI)

#### Struktura:
```
spi-example/
├── plugin-api/
│   └── src/
│       ├── module-info.java
│       └── com/example/spi/
│           └── Plugin.java
├── plugin-impl/
│   └── src/
│       ├── module-info.java
│       └── com/example/impl/
│           └── ConsolePlugin.java
└── plugin-app/
    └── src/
        ├── module-info.java
        └── com/example/app/
            └── PluginApp.java
```

#### plugin-api/module-info.java:
```java
module com.example.plugin.api {
    exports com.example.spi;
}
```

#### Plugin.java:
```java
package com.example.spi;

public interface Plugin {
    String getName();
    void execute();
}
```

#### plugin-impl/module-info.java:
```java
module com.example.plugin.impl {
    requires com.example.plugin.api;
    
    provides com.example.spi.Plugin 
        with com.example.impl.ConsolePlugin;
}
```

#### ConsolePlugin.java:
```java
package com.example.impl;

import com.example.spi.Plugin;

public class ConsolePlugin implements Plugin {
    @Override
    public String getName() {
        return "Console Plugin";
    }
    
    @Override
    public void execute() {
        System.out.println("ConsolePlugin: Executing plugin logic...");
        System.out.println("ConsolePlugin: Current time: " + 
            java.time.LocalDateTime.now());
    }
}
```

#### plugin-app/module-info.java:
```java
module com.example.plugin.app {
    requires com.example.plugin.api;
    uses com.example.spi.Plugin;
}
```

#### PluginApp.java:
```java
package com.example.app;

import com.example.spi.Plugin;
import java.util.ServiceLoader;

public class PluginApp {
    public static void main(String[] args) {
        System.out.println("Loading plugins...");
        
        ServiceLoader<Plugin> loader = ServiceLoader.load(Plugin.class);
        
        for (Plugin plugin : loader) {
            System.out.println("\nFound plugin: " + plugin.getName());
            plugin.execute();
        }
        
        if (!loader.iterator().hasNext()) {
            System.out.println("No plugins found!");
        }
    }
}
```

### Przykład 4: Refleksja i moduły

#### Struktura:
```
reflection-example/
├── entity-module/
│   └── src/
│       ├── module-info.java
│       └── com/example/entity/
│           └── User.java
└── reflection-module/
    └── src/
        ├── module-info.java
        └── com/example/reflection/
            └── ReflectionDemo.java
```

#### entity-module/module-info.java:
```java
module com.example.entity {
    // Eksportuje pakiet (dostęp do publicznych elementów)
    exports com.example.entity;
    
    // Otwiera pakiet dla refleksji
    opens com.example.entity to com.example.reflection;
}
```

#### User.java:
```java
package com.example.entity;

public class User {
    private int id;
    private String name;
    private String email;
    
    public User() {}
    
    public User(int id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    // Prywatna metoda do testowania refleksji
    private void sendNotification() {
        System.out.println("Sending notification to: " + email);
    }
    
    // Gettery i settery
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    @Override
    public String toString() {
        return "User{id=" + id + ", name='" + name + 
               "', email='" + email + "'}";
    }
}
```

#### reflection-module/module-info.java:
```java
module com.example.reflection {
    requires com.example.entity;
}
```

#### ReflectionDemo.java:
```java
package com.example.reflection;

import com.example.entity.User;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

public class ReflectionDemo {
    public static void main(String[] args) throws Exception {
        User user = new User(1, "Jan Kowalski", "jan@example.com");
        System.out.println("Original user: " + user);
        
        Class<?> userClass = user.getClass();
        
        // Dostęp do prywatnych pól
        System.out.println("\nAccessing private fields:");
        Field nameField = userClass.getDeclaredField("name");
        nameField.setAccessible(true);
        nameField.set(user, "Anna Nowak");
        System.out.println("Modified user: " + user);
        
        // Wywoływanie prywatnych metod
        System.out.println("\nInvoking private method:");
        Method privateMethod = userClass.getDeclaredMethod("sendNotification");
        privateMethod.setAccessible(true);
        privateMethod.invoke(user);
        
        // Wyświetlanie wszystkich pól
        System.out.println("\nAll fields:");
        for (Field field : userClass.getDeclaredFields()) {
            field.setAccessible(true);
            System.out.println(field.getName() + " = " + field.get(user));
        }
    }
}
```

## 8. Migracja istniejących aplikacji {#migracja}

### Strategia migracji

#### 1. Podejście Bottom-Up
Zacznij od modularyzacji bibliotek najniższego poziomu:

```
Krok 1: Biblioteki narzędziowe → moduły
Krok 2: Biblioteki domenowe → moduły  
Krok 3: Aplikacja główna → moduł
```

#### 2. Podejście Top-Down
Zacznij od aplikacji głównej używając modułów automatycznych:

```java
// Początkowy module-info.java
module my.app {
    requires java.sql;
    requires spring.core;      // Automatyczny moduł
    requires hibernate.core;   // Automatyczny moduł
}
```

### Przykład migracji rzeczywistej aplikacji

#### Przed migracją (aplikacja Spring Boot):
```
legacy-app/
├── src/main/java/
│   └── com/example/
│       ├── Application.java
│       ├── controller/
│       ├── service/
│       └── repository/
└── pom.xml
```

#### Po migracji:
```
modular-app/
├── app-api/
│   ├── src/main/java/
│   │   ├── module-info.java
│   │   └── com/example/api/
│   └── pom.xml
├── app-core/
│   ├── src/main/java/
│   │   ├── module-info.java
│   │   └── com/example/core/
│   └── pom.xml
├── app-web/
│   ├── src/main/java/
│   │   ├── module-info.java
│   │   └── com/example/web/
│   └── pom.xml
└── pom.xml
```

#### module-info.java dla app-web:
```java
module com.example.app.web {
    requires com.example.app.api;
    requires com.example.app.core;
    
    requires spring.boot;
    requires spring.boot.autoconfigure;
    requires spring.web;
    requires spring.context;
    
    // Dla autokonfiguracji Spring Boot
    opens com.example.web to spring.core, spring.beans, spring.context;
    opens com.example.web.config to spring.core, spring.beans, spring.context;
    
    // Dla kontrolerów REST
    opens com.example.web.controller to spring.web;
}
```

### Narzędzie jdeps do analizy zależności

```bash
# Analiza zależności JAR-a
jdeps --list-deps myapp.jar

# Generowanie module-info.java
jdeps --generate-module-info ./generated myapp.jar

# Analiza zależności między pakietami
jdeps -verbose:package myapp.jar

# Sprawdzenie użycia wewnętrznych API
jdeps --jdk-internals myapp.jar
```

Przykład wyniku jdeps:
```
myapp.jar -> java.base
myapp.jar -> java.sql
myapp.jar -> java.logging
myapp.jar -> lib/commons-lang3.jar
myapp.jar -> lib/slf4j-api.jar
```

## 9. Narzędzia i komendy {#narzedzia}

### Kompilacja modułów

#### Pojedynczy moduł:
```bash
# Struktura katalogów
src/
├── module-info.java
└── com/example/Main.java

# Kompilacja
javac -d mods/com.example \
    src/module-info.java \
    src/com/example/*.java

# Lub z użyciem --module-source-path
javac -d mods \
    --module-source-path src \
    -m com.example
```

#### Wiele modułów:
```bash
# Struktura
src/
├── com.example.api/
│   ├── module-info.java
│   └── com/example/api/
└── com.example.app/
    ├── module-info.java
    └── com/example/app/

# Kompilacja wszystkich modułów
javac -d mods \
    --module-source-path src \
    $(find src -name "*.java")
```

### Uruchamianie aplikacji modułowych

```bash
# Podstawowe uruchomienie
java --module-path mods \
     --module com.example.app/com.example.app.Main

# Skrócona forma
java -p mods -m com.example.app/com.example.app.Main

# Z dodatkowymi modułami
java --module-path mods:lib \
     --add-modules ALL-MODULE-PATH \
     --module com.example.app/com.example.app.Main
```

### Tworzenie modułowych JAR-ów

```bash
# Tworzenie JAR-a modułowego
jar --create \
    --file mods/com.example.app.jar \
    --main-class com.example.app.Main \
    --module-version 1.0 \
    -C mods/com.example.app .

# Sprawdzenie zawartości
jar --describe-module --file mods/com.example.app.jar
```

### Narzędzie jlink - tworzenie custom runtime

```bash
# Tworzenie minimalnego runtime
jlink --module-path $JAVA_HOME/jmods:mods \
      --add-modules com.example.app \
      --output myapp-runtime \
      --compress 2 \
      --no-header-files \
      --no-man-pages

# Uruchomienie z custom runtime
./myapp-runtime/bin/java -m com.example.app/com.example.app.Main
```

### Przykład skryptu budowania

```bash
#!/bin/bash
# build.sh - Kompletny skrypt budowania aplikacji modułowej

# Czyszczenie
rm -rf mods
mkdir -p mods

# Kompilacja
echo "Kompilacja modułów..."
javac -d mods \
    --module-source-path src \
    $(find src -name "*.java")

# Tworzenie JAR-ów
echo "Tworzenie JAR-ów..."
for module in $(ls src); do
    jar --create \
        --file mods/$module.jar \
        -C mods/$module .
done

# Tworzenie runtime (opcjonalne)
echo "Tworzenie custom runtime..."
jlink --module-path $JAVA_HOME/jmods:mods \
      --add-modules com.example.app \
      --output dist/runtime \
      --compress 2

echo "Budowanie zakończone!"
```

### Maven z modułami

```xml
<!-- pom.xml dla modułu -->
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>example-module</artifactId>
    <version>1.0.0</version>
    
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <release>11</release>
                </configuration>
            </plugin>
        </plugins>
    </build>
    
    <dependencies>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>1.7.32</version>
        </dependency>
    </dependencies>
</project>
```

### Gradle z modułami

```gradle
// build.gradle
plugins {
    id 'java'
    id 'application'
}

java {
    modularity.inferModulePath = true
    sourceCompatibility = JavaVersion.VERSION_11
}

application {
    mainModule = 'com.example.app'
    mainClass = 'com.example.app.Main'
}

dependencies {
    implementation 'org.slf4j:slf4j-api:1.7.32'
}

// Zadanie do tworzenia custom runtime
task customRuntime(type: Exec) {
    dependsOn jar
    commandLine 'jlink',
        '--module-path', "${System.properties['java.home']}/jmods:${jar.archivePath}",
        '--add-modules', 'com.example.app',
        '--output', "$buildDir/runtime",
        '--compress', '2'
}
```

## 10. Najlepsze praktyki {#najlepsze-praktyki}

### 1. Nazewnictwo modułów

```java
// ✅ Dobre nazwy
module com.company.product.feature { }
module org.apache.commons.lang3 { }

// ❌ Złe nazwy
module mymodule { }
module utils { }
```

### 2. Organizacja pakietów

```java
// ✅ Dobra organizacja
module com.example.userservice {
    exports com.example.userservice.api;      // Publiczne API
    exports com.example.userservice.dto;      // Transfer objects
    // com.example.userservice.internal       // Nie eksportowane
}

// ❌ Zła organizacja
module com.example.userservice {
    exports com.example.userservice;          // Eksportuje wszystko
}
```

### 3. Minimalizacja powierzchni API

```java
// ✅ Eksportuj tylko niezbędne pakiety
module com.example.library {
    exports com.example.library.api;
    // Implementacja pozostaje ukryta
}

// ❌ Nie eksportuj implementacji
module com.example.library {
    exports com.example.library.api;
    exports com.example.library.impl;  // Niepotrzebne!
}
```

### 4. Unikanie cyklicznych zależności

```java
// ❌ Cykliczne zależności
module A { requires B; }
module B { requires A; }  // Błąd kompilacji!

// ✅ Rozwiązanie - wydzielenie wspólnego API
module common.api { 
    exports com.example.common.api;
}
module A { 
    requires common.api;
    provides com.example.common.api.Service with A.ServiceImpl;
}
module B { 
    requires common.api;
    uses com.example.common.api.Service;
}
```

### 5. Testowanie modułów

```java
// src/test/java/module-info.java (dla testów)
open module com.example.app {
    requires com.example.app;  // Testowany moduł
    requires org.junit.jupiter.api;
    requires org.mockito;
}
```

### 6. Dokumentacja modułów

```java
/**
 * Moduł zarządzania użytkownikami.
 * 
 * <p>Ten moduł dostarcza API do operacji CRUD na użytkownikach
 * oraz mechanizmy autentykacji i autoryzacji.</p>
 * 
 * @provides com.example.spi.AuthenticationProvider
 * @uses com.example.spi.UserValidator
 * @since 1.0
 */
module com.example.usermanagement {
    // ...
}
```

### 7. Wersjonowanie modułów

```bash
# W manifeście JAR-a
jar --create \
    --file mymodule.jar \
    --module-version=1.2.3 \
    -C classes .

# Sprawdzenie wersji
jar --describe-module --file mymodule.jar
```

## 11. Rozwiązywanie problemów {#troubleshooting}

### Częste problemy i rozwiązania

#### Problem 1: Package is not visible
```
Error: Package com.example.internal is not visible
```

**Rozwiązanie:**
```java
// Dodaj export w module-info.java
module com.example {
    exports com.example.internal;  // Lub exports ... to specific.module
}
```

#### Problem 2: Module not found
```
Error: Module com.example.lib not found
```

**Rozwiązanie:**
```bash
# Sprawdź module-path
java --module-path mods:lib --list-modules

# Upewnij się, że moduł jest w ścieżce
java --module-path mods:lib --module com.example.app
```

#### Problem 3: Split packages
```
Error: Module com.example reads package javax.xml from both java.xml and java.xml.ws
```

**Rozwiązanie:**
```bash
# Wyklucz konfliktujący moduł
java --limit-modules java.base,java.xml,com.example.app
```

#### Problem 4: Refleksja nie działa
```
java.lang.IllegalAccessException: class X cannot access class Y
```

**Rozwiązanie:**
```java
// Otwórz pakiet dla refleksji
module com.example {
    opens com.example.beans;  // Lub opens ... to specific.module
}
```

#### Problem 5: Automatic modules i split packages
```bash
# Użyj patch-module dla rozwiązania konfliktów
java --module-path lib \
     --patch-module java.xml=lib/jaxb-impl.jar \
     --module com.example.app
```

### Debugowanie modułów

```bash
# Wyświetl załadowane moduły
java --show-module-resolution \
     --module-path mods \
     --module com.example.app

# Wyświetl dostępne moduły
java --list-modules

# Szczegółowe informacje o module
java --describe-module java.sql

# Sprawdź, które moduły eksportują pakiet
java --module-path mods --list-modules | grep "exports com.example"
```

### Flagi pomocnicze JVM

```bash
# Dodaj eksporty w runtime (dla kompatybilności)
java --add-exports java.base/sun.nio.ch=ALL-UNNAMED

# Otwórz pakiet dla refleksji
java --add-opens java.base/java.lang=ALL-UNNAMED

# Dodaj moduły do grafu
java --add-modules java.xml.bind,java.activation

# Zignoruj sprawdzanie modułów (ostateczność!)
java --illegal-access=permit  # Deprecated od Java 16
```

## 12. Podsumowanie {#podsumowanie}

### Kluczowe korzyści systemu modułów:

1. **Lepsza enkapsulacja** - kontrola nad tym, co jest publiczne
2. **Niezawodne konfiguracje** - błędy zależności wykrywane wcześniej
3. **Lepsza wydajność** - optymalizacja ładowania klas
4. **Mniejsze deployments** - custom runtime images
5. **Łatwiejsze utrzymanie** - jasna struktura zależności

### Kiedy używać modułów:

✅ **Używaj gdy:**
- Tworzysz nową aplikację/bibliotekę
- Potrzebujesz silnej enkapsulacji
- Chcesz zoptymalizować rozmiar aplikacji
- Tworzysz API dla innych deweloperów

❓ **Rozważ gdy:**
- Masz dużą aplikację legacy
- Używasz wielu frameworków
- Zespół nie jest zaznajomiony z modułami

❌ **Unikaj gdy:**
- Aplikacja jest bardzo mała
- Używasz starszych wersji bibliotek
- Koszt migracji przewyższa korzyści

### Przyszłość modułów

System modułów jest integralną częścią Javy i będzie rozwijany:
- Lepsze wsparcie w narzędziach
- Więcej bibliotek z module-info.java
- Optymalizacje w JVM
- Integracja z nowymi funkcjami języka

### Dodatkowe zasoby:

1. **Oficjalna dokumentacja:**
    - [JSR 376: Java Platform Module System](https://openjdk.org/projects/jigsaw/spec/)
    - [JEP 261: Module System](https://openjdk.org/jeps/261)

2. **Narzędzia:**
    - [ModiTect](https://github.com/moditect/moditect) - dodatki do Maven/Gradle
    - [Layrry](https://github.com/moditect/layrry) - launcher dla aplikacji modułowych

3. **Książki:**
    - "Java 9 Modularity" - Sander Mak, Paul Bakker
    - "The Java Module System" - Nicolai Parlog

### Przykład kompletnej aplikacji

Na zakończenie, oto struktura kompletnej aplikacji wykorzystującej wszystkie omówione koncepty:

```
complete-modular-app/
├── modules/
│   ├── api/
│   │   ├── src/main/java/
│   │   │   ├── module-info.java
│   │   │   └── com/app/api/
│   │   └── pom.xml
│   ├── core/
│   │   ├── src/main/java/
│   │   │   ├── module-info.java
│   │   │   └── com/app/core/
│   │   └── pom.xml
│   ├── data/
│   │   ├── src/main/java/
│   │   │   ├── module-info.java
│   │   │   └── com/app/data/
│   │   └── pom.xml
│   ├── web/
│   │   ├── src/main/java/
│   │   │   ├── module-info.java
│   │   │   └── com/app/web/
│   │   └── pom.xml
│   └── plugins/
│       ├── email-plugin/
│       └── sms-plugin/
├── scripts/
│   ├── build.sh
│   ├── package.sh
│   └── deploy.sh
├── config/
│   └── application.properties
├── docker/
│   └── Dockerfile
├── pom.xml
└── README.md
```

