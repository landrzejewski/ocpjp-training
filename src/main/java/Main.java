
import java.time.LocalDate;
import java.time.Month;
import java.util.Arrays;
import java.util.List;

public class Main {

    public static void main(String[] args) {
        System.out.println(9 % 4);
        System.out.println(9 % -4);
        System.out.println(-9 % 4);
        System.out.println(-9 % -4);

        Number time = 2025;

        if (time instanceof Integer year)
            System.out.println(year + " O'clock");
        else
            System.out.println(time);


        boolean eyesClosed = true;
        boolean breathingSlowly = true;
        boolean resting = eyesClosed | test();
        boolean asleep = eyesClosed & breathingSlowly;
        boolean awake = eyesClosed ^ breathingSlowly;

        int[] numbers = {2,4,6,8};
        System.out.println(Arrays.binarySearch(numbers, 2)); // 0
        System.out.println(Arrays.binarySearch(numbers, 4)); // 1
        System.out.println(Arrays.binarySearch(numbers, 1)); // -1
        System.out.println(Arrays.binarySearch(numbers, 3)); // -2
        System.out.println(Arrays.binarySearch(numbers, 9)); // -5

        System.out.println(LocalDate.of(2025,1, 1));

        long goat = (int)2;
        goat -= 1.0;

        int a = (short)4;
        int pig = 0;
        pig = a++;
        System.out.println(pig);
        System.out.println(a);

        System.out.print(glide("a"));
        System.out.print(glide("a", "b"));

    }

    public static String glide(String s) {
        return "1";
    }

//    public static String glide(String... s) {
//        return "2";
//    }

    public static String glide(Object o) {
        return "3";
    }

    public static String glide(String s, String t) {
        return "4";
    }

    private static boolean test()  {
        System.out.println("test");
        return true;
    }

}
