from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import cv2
import math
import numpy as np
import time
import cvzone
from cvzone.PoseModule import PoseDetector

counter = 0
direction = 0

def count_push_ups_from_video(video_path):
    # Existing code for counting push-ups from the video
    global counter, direction
    cap = cv2.VideoCapture(video_path)
    pd = PoseDetector(trackCon=0.70, detectionCon=0.70)

    while True:
        ret, img = cap.read()
        if not ret:
            break

        img = cv2.resize(img, (1000, 500))
        cvzone.putTextRect(img, 'AI Push Up Counter - Jenish', [345, 30], thickness=2, border=2, scale=2.5)
        pd.findPose(img, draw=0)
        lmlist, bbox = pd.findPosition(img, draw=0, bboxWithHands=0)

        angles(lmlist, 11, 13, 15, 12, 14, 16, drawpoints=True, img=img)

        # cv2.imshow('frame', img)
        # cv2.waitKey(1)
        time.sleep(0.02)

        # Check for the 'q' key to break the loop if pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    return counter

def angles(lmlist, p1, p2, p3, p4, p5, p6, drawpoints=False, img=None):
    # Your existing angles() function code from the initial question
    global counter, direction

    if len(lmlist)!= 0:
        point1 = lmlist[p1]
        point2 = lmlist[p2]
        point3 = lmlist[p3]
        point4 = lmlist[p4]
        point5 = lmlist[p5]
        point6 = lmlist[p6]
        x1,y1 = point1[1:-1]
        x2, y2 = point2[1:-1]
        x3, y3 = point3[1:-1]
        x4, y4 = point4[1:-1]
        x5, y5 = point5[1:-1]
        x6, y6 = point6[1:-1]

        lefthandangle = math.degrees(math.atan2(y3 - y2, x3 - x2) -
                                     math.atan2(y1 - y2, x1 - x2))
        righthandangle = math.degrees(math.atan2(y6 - y5, x6 - x5) -
                                      math.atan2(y4 - y5, x4 - x5))
        # print(lefthandangle,righthandangle)
        leftHandAngle = int(np.interp(lefthandangle, [-30, 180], [100, 0]))
        rightHandAngle = int(np.interp(righthandangle, [34, 173], [100, 0]))
        left, right = leftHandAngle, rightHandAngle

        if left >= 50 and right >= 50:
            if direction == 0:
                counter += 0.5
                direction = 1
        if left <= 50 and right <= 50:
            if direction == 1:
                counter += 0.5
                direction = 0

        # cv2.rectangle(img, (0, 0), (120, 120), (255, 0, 0), -1)
        # cv2.putText(img, str(int(counter)), (20, 70), cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, 1.6, (0, 0, 255), 7)
        # leftval  = np.interp(right,[0,100],[400,200])
        # rightval = np.interp(right, [0, 100], [400, 200])
        # cv2.putText(img,'R', (24, 195), cv2.FONT_HERSHEY_DUPLEX, 1, (255, 0, 255), 7)
        # cv2.rectangle(img,(8,200),(50,400),(0,255,0),5)
        # cv2.rectangle(img, (8, int(rightval)), (50, 400), (255,0, 0), -1)
        # cv2.putText(img, 'L', (962, 195), cv2.FONT_HERSHEY_DUPLEX, 1, (255, 0, 255), 7)
        # cv2.rectangle(img, (952, 200), (995, 400), (0, 255, 0), 5)
        # cv2.rectangle(img, (952, int(leftval)), (995, 400), (255, 0, 0), -1)
        # if left > 70:
        #     cv2.rectangle(img, (952, int(leftval)), (995, 400), (0, 0, 255), -1)
        # if right > 70:
        #     cv2.rectangle(img, (8, int(leftval)), (50, 400), (0, 0, 255), -1)
        
    return counter

@csrf_exempt
def pushup_counter_api(request):
    if request.method == 'POST':
        video_file = request.FILES.get('video', None)

        if video_file:
            video_path = 'temp_video.mp4'  # Temporary path to save the uploaded video
            with open(video_path, 'wb') as file:
                for chunk in video_file.chunks():
                    file.write(chunk)

            # Call the push-up counting function
            push_up_count = count_push_ups_from_video(video_path)

            # Delete the temporary video file
            import os
            os.remove(video_path)

            return JsonResponse({'push_up_count': push_up_count})

    return JsonResponse({'error': 'Invalid request'}, status=400)
