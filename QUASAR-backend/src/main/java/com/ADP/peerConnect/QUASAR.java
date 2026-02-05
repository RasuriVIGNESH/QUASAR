package com.ADP.peerConnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.ZoneId;
import java.util.TimeZone;

@SpringBootApplication
public class QUASAR {

	public static void main(String[] args) {
		System.out.println("JVM default TimeZone (TimeZone) : "
				+ TimeZone.getDefault().getID());

		System.out.println("JVM default ZoneId : "
				+ ZoneId.systemDefault());
		SpringApplication.run(QUASAR.class, args);
	}
}

// add roles 1) College admin 2) mentor
